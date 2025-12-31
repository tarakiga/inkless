package ledger

import (
	"context"
	"crypto/ecdsa"
	"fmt"
	"math/big"
	"strings"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
)

// InklessRegistry ABI (simplified for anchorSignature function)
const InklessRegistryABI = `[
	{
		"inputs": [
			{"internalType": "bytes32", "name": "_docHash", "type": "bytes32"},
			{"internalType": "bytes", "name": "_pqcSignature", "type": "bytes"},
			{"internalType": "bytes32", "name": "_hardwareID", "type": "bytes32"}
		],
		"name": "anchorSignature",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [{"internalType": "bytes32", "name": "_docHash", "type": "bytes32"}],
		"name": "verifySignature",
		"outputs": [
			{"internalType": "bool", "name": "isValid", "type": "bool"},
			{"internalType": "address", "name": "signerDID", "type": "address"},
			{"internalType": "uint256", "name": "timestamp", "type": "uint256"},
			{"internalType": "bytes32", "name": "hardwareID", "type": "bytes32"}
		],
		"stateMutability": "view",
		"type": "function"
	}
]`

// Client wraps the Ethereum client and contract interaction
type Client struct {
	ethClient       *ethclient.Client
	contractAddress common.Address
	privateKey      *ecdsa.PrivateKey
	chainID         *big.Int
	contractABI     abi.ABI
}

// NewClient creates a new ledger client
func NewClient(rpcURL, contractAddr, privateKeyHex string) (*Client, error) {
	// Connect to Ethereum node
	client, err := ethclient.Dial(rpcURL)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to Ethereum node: %w", err)
	}

	// Get chain ID
	chainID, err := client.ChainID(context.Background())
	if err != nil {
		return nil, fmt.Errorf("failed to get chain ID: %w", err)
	}

	// Parse private key (remove 0x prefix if present)
	privateKeyHex = strings.TrimPrefix(privateKeyHex, "0x")
	privateKey, err := crypto.HexToECDSA(privateKeyHex)
	if err != nil {
		return nil, fmt.Errorf("invalid private key: %w", err)
	}

	// Parse contract address
	if !common.IsHexAddress(contractAddr) {
		return nil, fmt.Errorf("invalid contract address: %s", contractAddr)
	}

	// Parse ABI
	parsedABI, err := abi.JSON(strings.NewReader(InklessRegistryABI))
	if err != nil {
		return nil, fmt.Errorf("failed to parse ABI: %w", err)
	}

	return &Client{
		ethClient:       client,
		contractAddress: common.HexToAddress(contractAddr),
		privateKey:      privateKey,
		chainID:         chainID,
		contractABI:     parsedABI,
	}, nil
}

// AnchorSignature submits a signature to the blockchain
func (c *Client) AnchorSignature(ctx context.Context, docHash string, signature []byte, hardwareID string) (string, error) {
	// Convert docHash to bytes32 (pad or truncate to 32 bytes)
	docHashBytes := common.HexToHash(docHash)

	// Convert hardwareID to bytes32
	hardwareIDBytes := crypto.Keccak256Hash([]byte(hardwareID))

	// Pack the function call
	data, err := c.contractABI.Pack("anchorSignature", docHashBytes, signature, hardwareIDBytes)
	if err != nil {
		return "", fmt.Errorf("failed to pack transaction data: %w", err)
	}

	// Get the sender address
	publicKey := c.privateKey.Public()
	publicKeyECDSA, ok := publicKey.(*ecdsa.PublicKey)
	if !ok {
		return "", fmt.Errorf("error casting public key to ECDSA")
	}
	fromAddress := crypto.PubkeyToAddress(*publicKeyECDSA)

	// Get nonce
	nonce, err := c.ethClient.PendingNonceAt(ctx, fromAddress)
	if err != nil {
		return "", fmt.Errorf("failed to get nonce: %w", err)
	}

	// Get gas price
	gasPrice, err := c.ethClient.SuggestGasPrice(ctx)
	if err != nil {
		return "", fmt.Errorf("failed to suggest gas price: %w", err)
	}

	// Create transaction
	tx := types.NewTransaction(
		nonce,
		c.contractAddress,
		big.NewInt(0),  // No ETH value
		uint64(500000), // Gas limit
		gasPrice,
		data,
	)

	// Sign transaction
	signedTx, err := types.SignTx(tx, types.NewEIP155Signer(c.chainID), c.privateKey)
	if err != nil {
		return "", fmt.Errorf("failed to sign transaction: %w", err)
	}

	// Send transaction
	err = c.ethClient.SendTransaction(ctx, signedTx)
	if err != nil {
		return "", fmt.Errorf("failed to send transaction: %w", err)
	}

	return signedTx.Hash().Hex(), nil
}

// VerifySignature checks if a document hash exists on the blockchain
func (c *Client) VerifySignature(ctx context.Context, docHash string) (bool, string, int64, error) {
	docHashBytes := common.HexToHash(docHash)

	// Pack call data
	data, err := c.contractABI.Pack("verifySignature", docHashBytes)
	if err != nil {
		return false, "", 0, fmt.Errorf("failed to pack call data: %w", err)
	}

	// Make static call
	result, err := c.ethClient.CallContract(ctx, ethereum.CallMsg{
		To:   &c.contractAddress,
		Data: data,
	}, nil)
	if err != nil {
		return false, "", 0, fmt.Errorf("failed to call contract: %w", err)
	}

	// Unpack result
	var (
		isValid    bool
		signerDID  common.Address
		timestamp  *big.Int
		hardwareID [32]byte
	)

	unpacked, err := c.contractABI.Unpack("verifySignature", result)
	if err != nil {
		return false, "", 0, fmt.Errorf("failed to unpack result: %w", err)
	}

	isValid = unpacked[0].(bool)
	signerDID = unpacked[1].(common.Address)
	timestamp = unpacked[2].(*big.Int)
	_ = hardwareID // Unused for now

	return isValid, signerDID.Hex(), timestamp.Int64(), nil
}

// Close closes the Ethereum client connection
func (c *Client) Close() {
	c.ethClient.Close()
}
