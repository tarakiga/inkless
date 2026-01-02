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
	DID        string `json:"did"`
	Name       string `json:"name"`
	Email      string `json:"email,omitempty"`
	IsVerified bool   `json:"isVerified"`
}

// UpdateProfileRequest represents the request to update profile
type UpdateProfileRequest struct {
	Name  string `json:"name"`
	Email string `json:"email"`
}

// GetProfile handles GET /api/v1/profile
func (h *ProfileHandler) GetProfile(c echo.Context) error {
	// For MVP, we use a demo user. In production, this comes from auth middleware.
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

	// Set default name if empty
	name := user.FullName
	if name == "" {
		name = "Demo User"
	}

	// Count user's signatures for "verification" status
	var sigCount int64
	db.DB.Model(&models.SignatureMetadata{}).Where("signer_id = ?", user.ID).Count(&sigCount)

	return c.JSON(http.StatusOK, ProfileResponse{
		DID:        user.DIDAddress,
		Name:       name,
		Email:      user.Email,
		IsVerified: sigCount > 0,
	})
}

// UpdateProfile handles PATCH /api/v1/profile
func (h *ProfileHandler) UpdateProfile(c echo.Context) error {
	var req UpdateProfileRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	// For MVP, update the demo user
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

	// Update fields
	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["full_name"] = req.Name
	}
	if req.Email != "" {
		updates["email"] = req.Email
	}

	if len(updates) > 0 {
		if err := db.DB.Model(&user).Updates(updates).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to update profile",
			})
		}
	}

	// Reload user
	db.DB.First(&user, user.ID)

	var sigCount int64
	db.DB.Model(&models.SignatureMetadata{}).Where("signer_id = ?", user.ID).Count(&sigCount)

	return c.JSON(http.StatusOK, ProfileResponse{
		DID:        user.DIDAddress,
		Name:       user.FullName,
		Email:      user.Email,
		IsVerified: sigCount > 0,
	})
}
