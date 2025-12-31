package ledger

import (
	"log"
	"sync"
)

var (
	// Global is the global ledger client instance
	Global *Client
	once   sync.Once
)

// Initialize sets up the global ledger client
func Initialize(rpcURL, contractAddr, privateKeyHex string) error {
	var initErr error

	once.Do(func() {
		// Skip initialization if contract address is not configured
		if contractAddr == "" {
			log.Println("[Ledger] No contract address configured, using mock mode")
			return
		}

		client, err := NewClient(rpcURL, contractAddr, privateKeyHex)
		if err != nil {
			log.Printf("[Ledger] Failed to initialize: %v (falling back to mock mode)", err)
			initErr = err
			return
		}

		Global = client
		log.Printf("[Ledger] Connected to blockchain at %s", rpcURL)
		log.Printf("[Ledger] Contract: %s", contractAddr)
	})

	return initErr
}

// IsConnected returns true if the ledger client is connected
func IsConnected() bool {
	return Global != nil
}
