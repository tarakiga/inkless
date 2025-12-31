// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title InklessRegistry
 * @dev Stores document signature records for the Inkless decentralized signature protocol.
 * Documents are never uploaded; only cryptographic hashes are anchored on-chain.
 * Designed for Hyperledger Besu deployment (Nigerian data residency).
 */
contract InklessRegistry {
    // ============ Data Structures ============

    struct SignatureRecord {
        bytes32 docHash;          // SHA-3 hash of the document
        address signerDID;        // The Decentralized ID (address) of the signer
        bytes pqcSignature;       // Crystals-Dilithium post-quantum signature
        uint256 timestamp;        // Block time of anchoring
        bytes32 hardwareID;       // Hash of the device TPM/Secure Enclave ID
        bool isRevoked;           // For compliance-based revocation (NDPA 2023)
    }

    // ============ State Variables ============

    // Mapping from document hash to signature record
    mapping(bytes32 => SignatureRecord) public signatures;

    // List of all anchored document hashes (for enumeration)
    bytes32[] public documentHashes;

    // Access control: verified DIDs that can anchor signatures
    mapping(address => bool) public verifiedSigners;

    // Contract owner (for admin functions)
    address public owner;

    // ============ Events ============

    event SignatureAnchored(
        bytes32 indexed docHash,
        address indexed signerDID,
        uint256 timestamp,
        bytes32 hardwareID
    );

    event SignatureRevoked(
        bytes32 indexed docHash,
        address indexed revoker,
        uint256 timestamp
    );

    event SignerVerified(
        address indexed signerDID,
        uint256 timestamp
    );

    event SignerRemoved(
        address indexed signerDID,
        uint256 timestamp
    );

    // ============ Modifiers ============

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyVerifiedSigner() {
        require(verifiedSigners[msg.sender], "Only verified signers can anchor");
        _;
    }

    modifier documentNotExists(bytes32 _docHash) {
        require(signatures[_docHash].timestamp == 0, "Document already anchored");
        _;
    }

    modifier documentExists(bytes32 _docHash) {
        require(signatures[_docHash].timestamp != 0, "Document not found");
        _;
    }

    // ============ Constructor ============

    constructor() {
        owner = msg.sender;
        verifiedSigners[msg.sender] = true;
    }

    // ============ Core Functions ============

    /**
     * @dev Anchor a new document signature on-chain
     * @param _docHash SHA-3 hash of the document
     * @param _pqcSignature Crystals-Dilithium signature bytes
     * @param _hardwareID Hash of the signer's device hardware ID
     */
    function anchorSignature(
        bytes32 _docHash,
        bytes calldata _pqcSignature,
        bytes32 _hardwareID
    ) external onlyVerifiedSigner documentNotExists(_docHash) {
        require(_docHash != bytes32(0), "Invalid document hash");
        require(_pqcSignature.length > 0, "Invalid signature");
        require(_hardwareID != bytes32(0), "Invalid hardware ID");

        signatures[_docHash] = SignatureRecord({
            docHash: _docHash,
            signerDID: msg.sender,
            pqcSignature: _pqcSignature,
            timestamp: block.timestamp,
            hardwareID: _hardwareID,
            isRevoked: false
        });

        documentHashes.push(_docHash);

        emit SignatureAnchored(_docHash, msg.sender, block.timestamp, _hardwareID);
    }

    /**
     * @dev Verify a document signature exists and is valid
     * @param _docHash SHA-3 hash of the document to verify
     * @return isValid Whether the signature exists and is not revoked
     * @return signerDID The DID of the signer
     * @return timestamp When the signature was anchored
     * @return hardwareID The hardware ID used for signing
     */
    function verifySignature(bytes32 _docHash) 
        external 
        view 
        returns (
            bool isValid,
            address signerDID,
            uint256 timestamp,
            bytes32 hardwareID
        ) 
    {
        SignatureRecord memory record = signatures[_docHash];
        
        if (record.timestamp == 0) {
            return (false, address(0), 0, bytes32(0));
        }

        return (
            !record.isRevoked,
            record.signerDID,
            record.timestamp,
            record.hardwareID
        );
    }

    /**
     * @dev Get full signature record
     * @param _docHash SHA-3 hash of the document
     */
    function getSignatureRecord(bytes32 _docHash) 
        external 
        view 
        documentExists(_docHash)
        returns (SignatureRecord memory) 
    {
        return signatures[_docHash];
    }

    /**
     * @dev Revoke a signature (for NDPA 2023 compliance - "Right to be Forgotten")
     * Only the original signer or contract owner can revoke
     * @param _docHash SHA-3 hash of the document to revoke
     */
    function revokeSignature(bytes32 _docHash) 
        external 
        documentExists(_docHash) 
    {
        SignatureRecord storage record = signatures[_docHash];
        require(
            msg.sender == record.signerDID || msg.sender == owner,
            "Not authorized to revoke"
        );
        require(!record.isRevoked, "Already revoked");

        record.isRevoked = true;

        emit SignatureRevoked(_docHash, msg.sender, block.timestamp);
    }

    // ============ Admin Functions ============

    /**
     * @dev Add a verified signer (NIMC-verified DID)
     * @param _signer Address of the signer to verify
     */
    function addVerifiedSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid address");
        require(!verifiedSigners[_signer], "Already verified");

        verifiedSigners[_signer] = true;

        emit SignerVerified(_signer, block.timestamp);
    }

    /**
     * @dev Remove a verified signer
     * @param _signer Address of the signer to remove
     */
    function removeVerifiedSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Invalid address");
        require(verifiedSigners[_signer], "Not a verified signer");

        verifiedSigners[_signer] = false;

        emit SignerRemoved(_signer, block.timestamp);
    }

    /**
     * @dev Transfer contract ownership
     * @param _newOwner Address of the new owner
     */
    function transferOwnership(address _newOwner) external onlyOwner {
        require(_newOwner != address(0), "Invalid address");
        owner = _newOwner;
    }

    // ============ View Functions ============

    /**
     * @dev Get total number of anchored documents
     */
    function getTotalDocuments() external view returns (uint256) {
        return documentHashes.length;
    }

    /**
     * @dev Check if a signer is verified
     * @param _signer Address to check
     */
    function isVerifiedSigner(address _signer) external view returns (bool) {
        return verifiedSigners[_signer];
    }

    /**
     * @dev Check if a document has been anchored
     * @param _docHash SHA-3 hash to check
     */
    function isDocumentAnchored(bytes32 _docHash) external view returns (bool) {
        return signatures[_docHash].timestamp != 0;
    }
}
