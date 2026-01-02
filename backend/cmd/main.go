package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"time"

	"github.com/inkless/backend/internal/api/handlers"
	"github.com/inkless/backend/internal/config"
	"github.com/inkless/backend/internal/db"
	"github.com/inkless/backend/internal/ledger"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Connect to database
	if err := db.Connect(cfg); err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Run migrations
	if err := db.Migrate(); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize blockchain ledger (optional - falls back to mock if not configured)
	if err := ledger.Initialize(cfg.BesuNodeURL, cfg.ContractAddress, cfg.SignerPrivateKey); err != nil {
		log.Printf("Warning: Ledger initialization failed: %v", err)
	}

	// Initialize Echo
	e := echo.New()
	e.HideBanner = true

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	// Standard CORS middleware
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions, http.MethodHead},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		MaxAge:       86400,
	}))
	e.Use(middleware.RequestID())

	// Health check
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(http.StatusOK, map[string]string{
			"status": "healthy",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	// API v1 routes
	v1 := e.Group("/api/v1")

	// Identity routes (NIMC mock)
	identityHandler := handlers.NewIdentityHandler()
	v1.POST("/identity/verify", identityHandler.Verify)

	// Signature routes
	signatureHandler := handlers.NewSignatureHandler()
	v1.POST("/signatures/anchor", signatureHandler.Anchor)
	v1.GET("/signatures/recent", signatureHandler.GetRecent)
	v1.GET("/verify/:docHash", signatureHandler.Verify)

	// Offline sync routes (QR-based signing)
	offlineHandler := handlers.NewOfflineHandler()
	v1.POST("/offline/sync", offlineHandler.Sync)
	v1.GET("/offline/pending", offlineHandler.GetPendingCount)

	// Export routes
	exportHandler := handlers.NewExportHandler()
	v1.GET("/files/:docHash/audit-trail", exportHandler.ExportAuditTrail)

	// Device routes
	deviceHandler := handlers.NewDeviceHandler()
	v1.GET("/devices", deviceHandler.ListDevices)
	v1.POST("/devices", deviceHandler.RegisterDevice)
	v1.DELETE("/devices/:id", deviceHandler.RemoveDevice)
	v1.POST("/devices/revoke-all", deviceHandler.RevokeAllDevices)

	// Profile routes
	profileHandler := handlers.NewProfileHandler()
	v1.GET("/profile", profileHandler.GetProfile)
	v1.PATCH("/profile", profileHandler.UpdateProfile)

	// Preferences routes
	preferencesHandler := handlers.NewPreferencesHandler()
	v1.GET("/preferences", preferencesHandler.GetPreferences)
	v1.GET("/preferences", preferencesHandler.GetPreferences)
	v1.PATCH("/preferences", preferencesHandler.UpdatePreferences)

	// Stats routes
	statsHandler := handlers.NewStatsHandler()
	v1.GET("/stats", statsHandler.GetDashboardStats)

	// Start server with graceful shutdown
	go func() {
		addr := cfg.ServerHost + ":" + cfg.ServerPort
		log.Printf("Starting Inkless API server on %s", addr)
		if err := e.Start(addr); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	<-quit

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	log.Println("Shutting down server...")
	if err := e.Shutdown(ctx); err != nil {
		log.Fatalf("Server shutdown error: %v", err)
	}
	log.Println("Server stopped")
}
