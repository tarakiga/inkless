package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/inkless/backend/internal/db"
	"github.com/inkless/backend/internal/db/models"
)

// PreferencesHandler handles user preferences API endpoints
type PreferencesHandler struct{}

// NewPreferencesHandler creates a new PreferencesHandler
func NewPreferencesHandler() *PreferencesHandler {
	return &PreferencesHandler{}
}

// PreferencesResponse represents user preferences in API responses
type PreferencesResponse struct {
	Theme              string `json:"theme"`
	NotifyOnSign       bool   `json:"notifyOnSign"`
	NotifyOnNewDevice  bool   `json:"notifyOnNewDevice"`
	NotifyWeeklyReport bool   `json:"notifyWeeklyReport"`
}

// UpdatePreferencesRequest represents the request to update preferences
type UpdatePreferencesRequest struct {
	Theme              *string `json:"theme,omitempty"`
	NotifyOnSign       *bool   `json:"notifyOnSign,omitempty"`
	NotifyOnNewDevice  *bool   `json:"notifyOnNewDevice,omitempty"`
	NotifyWeeklyReport *bool   `json:"notifyWeeklyReport,omitempty"`
}

// GetPreferences handles GET /api/v1/preferences
func (h *PreferencesHandler) GetPreferences(c echo.Context) error {
	// Get or create demo user
	var user models.User
	result := db.DB.Where("did_address = ?", "did:inkless:demo").FirstOrCreate(&user, models.User{
		DIDAddress: "did:inkless:demo",
		FullName:   "Demo User",
		Email:      "demo@inkless.app",
	})
	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to get or create user",
		})
	}

	// Get or create preferences
	var prefs models.UserPreferences
	result = db.DB.FirstOrCreate(&prefs, models.UserPreferences{
		UserID: user.ID,
	})

	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch preferences",
		})
	}

	return c.JSON(http.StatusOK, PreferencesResponse{
		Theme:              prefs.Theme,
		NotifyOnSign:       prefs.NotifyOnSign,
		NotifyOnNewDevice:  prefs.NotifyOnNewDevice,
		NotifyWeeklyReport: prefs.NotifyWeeklyReport,
	})
}

// UpdatePreferences handles PATCH /api/v1/preferences
func (h *PreferencesHandler) UpdatePreferences(c echo.Context) error {
	var req UpdatePreferencesRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	// Get or create demo user
	var user models.User
	if err := db.DB.Where("did_address = ?", "did:inkless:demo").FirstOrCreate(&user, models.User{
		DIDAddress: "did:inkless:demo",
		FullName:   "Demo User",
		Email:      "demo@inkless.app",
	}).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to get or create user",
		})
	}

	// Get or create preferences
	var prefs models.UserPreferences
	db.DB.FirstOrCreate(&prefs, models.UserPreferences{
		UserID: user.ID,
	})

	// Build updates map
	updates := map[string]interface{}{}
	if req.Theme != nil {
		updates["theme"] = *req.Theme
	}
	if req.NotifyOnSign != nil {
		updates["notify_on_sign"] = *req.NotifyOnSign
	}
	if req.NotifyOnNewDevice != nil {
		updates["notify_on_new_device"] = *req.NotifyOnNewDevice
	}
	if req.NotifyWeeklyReport != nil {
		updates["notify_weekly_report"] = *req.NotifyWeeklyReport
	}

	if len(updates) > 0 {
		if err := db.DB.Model(&prefs).Updates(updates).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to update preferences",
			})
		}
	}

	// Reload
	db.DB.First(&prefs, prefs.ID)

	return c.JSON(http.StatusOK, PreferencesResponse{
		Theme:              prefs.Theme,
		NotifyOnSign:       prefs.NotifyOnSign,
		NotifyOnNewDevice:  prefs.NotifyOnNewDevice,
		NotifyWeeklyReport: prefs.NotifyWeeklyReport,
	})
}
