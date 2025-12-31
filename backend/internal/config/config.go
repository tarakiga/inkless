package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

// Config holds all application configuration
type Config struct {
	// Server
	ServerPort string
	ServerHost string

	// Database
	DatabaseURL string

	// Redis
	RedisURL string

	// Blockchain
	BesuNodeURL      string
	ContractAddress  string
	SignerPrivateKey string

	// NIMC (Mock for MVP)
	NIMCAPIEnabled bool
	NIMCMockMode   bool

	// JWT
	JWTSecret string

	// Environment
	Environment string
}

// Load reads configuration from environment variables
func Load() *Config {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	return &Config{
		ServerPort:       getEnv("SERVER_PORT", "8080"),
		ServerHost:       getEnv("SERVER_HOST", "0.0.0.0"),
		DatabaseURL:      getEnv("DATABASE_URL", "postgres://inkless:inkless@localhost:5432/inkless?sslmode=disable"),
		RedisURL:         getEnv("REDIS_URL", "redis://localhost:6379"),
		BesuNodeURL:      getEnv("BESU_NODE_URL", "http://localhost:8545"),
		ContractAddress:  getEnv("CONTRACT_ADDRESS", ""),
		SignerPrivateKey: getEnv("SIGNER_PRIVATE_KEY", ""),
		NIMCAPIEnabled:   getEnvBool("NIMC_API_ENABLED", false),
		NIMCMockMode:     getEnvBool("NIMC_MOCK_MODE", true),
		JWTSecret:        getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Environment:      getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		return value == "true" || value == "1"
	}
	return defaultValue
}
