package db

import (
	"log"

	"github.com/inkless/backend/internal/config"
	"github.com/inkless/backend/internal/db/models"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

// Connect establishes a database connection
func Connect(cfg *config.Config) error {
	var gormConfig *gorm.Config

	if cfg.Environment == "production" {
		gormConfig = &gorm.Config{
			Logger: logger.Default.LogMode(logger.Error),
		}
	} else {
		gormConfig = &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		}
	}

	var err error
	DB, err = gorm.Open(postgres.Open(cfg.DatabaseURL), gormConfig)
	if err != nil {
		return err
	}

	log.Println("Database connection established")
	return nil
}

// Migrate runs auto-migration for all models
func Migrate() error {
	log.Println("Running database migrations...")

	err := DB.AutoMigrate(
		&models.User{},
		&models.AuditLog{},
		&models.SignatureMetadata{},
		&models.VerificationToken{},
		&models.OfflineSignature{},
		&models.TrustedDevice{},
		&models.UserPreferences{},
	)

	if err != nil {
		return err
	}

	log.Println("Database migrations completed")
	return nil
}

// Close closes the database connection
func Close() error {
	sqlDB, err := DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
