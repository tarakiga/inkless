package handlers

import (
	"net/http"

	"github.com/labstack/echo/v4"

	"github.com/inkless/backend/internal/db"
	"github.com/inkless/backend/internal/db/models"
)

// ProfileHandler handles profile-related API endpoints
type ProfileHandler struct{}

// NewProfileHandler creates a new ProfileHandler
func NewProfileHandler() *ProfileHandler {
	return &ProfileHandler{}
}

// ProfileResponse represents the user profile in API responses
type ProfileResponse struct {
	ID         string `json:"id"`
	DIDAddress string `json:"didAddress"`
	FullName   string `json:"fullName"`
	Email      string `json:"email,omitempty"`
	IsVerified bool   `json:"isVerified"`
}

// GetProfile handles GET /api/v1/profile
func (h *ProfileHandler) GetProfile(c echo.Context) error {
	// For MVP, we return mock profile data
	// In production, this would come from auth middleware and database lookup

	// Try to find the demo user, or create one
	var user models.User
	result := db.DB.FirstOrCreate(&user, models.User{
		DIDAddress:   "did:inkless:demo",
		DevicePubKey: "demo_pub_key",
	})

	if result.Error != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch profile",
		})
	}

	// Count user's signatures for "verification" status
	var sigCount int64
	db.DB.Model(&models.SignatureMetadata{}).Where("signer_id = ?", user.ID).Count(&sigCount)

	return c.JSON(http.StatusOK, ProfileResponse{
		ID:         user.ID.String(),
		DIDAddress: user.DIDAddress,
		FullName:   "Demo User", // Would come from NIMC in production
		IsVerified: sigCount > 0,
	})
}
