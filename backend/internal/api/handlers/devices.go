package handlers

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/labstack/echo/v4"

	"github.com/inkless/backend/internal/db"
	"github.com/inkless/backend/internal/db/models"
)

// DeviceHandler handles device-related API endpoints
type DeviceHandler struct{}

// NewDeviceHandler creates a new DeviceHandler
func NewDeviceHandler() *DeviceHandler {
	return &DeviceHandler{}
}

// DeviceResponse represents a device in API responses
type DeviceResponse struct {
	ID         string `json:"id"`
	DeviceName string `json:"deviceName"`
	DeviceType string `json:"deviceType"`
	Location   string `json:"location"`
	LastSeenAt string `json:"lastSeenAt"`
	IsActive   bool   `json:"isActive"`
	IsCurrent  bool   `json:"isCurrent"`
}

// RegisterDeviceRequest represents the request to register a new device
type RegisterDeviceRequest struct {
	DeviceName string `json:"deviceName"`
	DeviceType string `json:"deviceType"` // mobile, desktop, tablet
}

// ListDevices handles GET /api/v1/devices
func (h *DeviceHandler) ListDevices(c echo.Context) error {
	// For MVP, we'll use a mock user ID. In production, this comes from auth middleware.
	// Get all devices (for demo, we return all devices in the system)
	var devices []models.TrustedDevice
	if err := db.DB.Order("last_seen_at desc").Limit(10).Find(&devices).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch devices",
		})
	}

	// Get current request info to mark current device
	currentIP := c.RealIP()

	response := make([]DeviceResponse, len(devices))
	for i, device := range devices {
		response[i] = DeviceResponse{
			ID:         device.ID.String(),
			DeviceName: device.DeviceName,
			DeviceType: device.DeviceType,
			Location:   device.Location,
			LastSeenAt: device.LastSeenAt.Format(time.RFC3339),
			IsActive:   device.IsActive,
			IsCurrent:  device.IPAddress == currentIP,
		}
	}

	return c.JSON(http.StatusOK, response)
}

// RegisterDevice handles POST /api/v1/devices
func (h *DeviceHandler) RegisterDevice(c echo.Context) error {
	var req RegisterDeviceRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	if req.DeviceName == "" {
		req.DeviceName = "Unknown Device"
	}
	if req.DeviceType == "" {
		req.DeviceType = "desktop"
	}

	// Get request metadata
	userAgent := c.Request().UserAgent()
	ipAddress := c.RealIP()

	// For MVP, create a mock user or find existing
	var user models.User
	db.DB.FirstOrCreate(&user, models.User{
		DIDAddress:   "did:inkless:demo",
		DevicePubKey: "demo_pub_key",
	})

	// Derive location from IP (simplified - in production use a geo-IP service)
	location := "Unknown"
	if ipAddress == "127.0.0.1" || ipAddress == "::1" {
		location = "Local"
	}

	device := models.TrustedDevice{
		UserID:     user.ID,
		DeviceName: req.DeviceName,
		DeviceType: req.DeviceType,
		UserAgent:  userAgent,
		IPAddress:  ipAddress,
		Location:   location,
		LastSeenAt: time.Now(),
		IsActive:   true,
	}

	if err := db.DB.Create(&device).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to register device",
		})
	}

	return c.JSON(http.StatusCreated, DeviceResponse{
		ID:         device.ID.String(),
		DeviceName: device.DeviceName,
		DeviceType: device.DeviceType,
		Location:   device.Location,
		LastSeenAt: device.LastSeenAt.Format(time.RFC3339),
		IsActive:   device.IsActive,
		IsCurrent:  true,
	})
}

// RemoveDevice handles DELETE /api/v1/devices/:id
func (h *DeviceHandler) RemoveDevice(c echo.Context) error {
	deviceID := c.Param("id")

	parsedID, err := uuid.Parse(deviceID)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid device ID",
		})
	}

	// Soft delete - just mark as inactive
	result := db.DB.Model(&models.TrustedDevice{}).Where("id = ?", parsedID).Update("is_active", false)
	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to remove device",
		})
	}

	if result.RowsAffected == 0 {
		return c.JSON(http.StatusNotFound, map[string]string{
			"error": "Device not found",
		})
	}

	return c.JSON(http.StatusOK, map[string]string{
		"message": "Device removed successfully",
	})
}
