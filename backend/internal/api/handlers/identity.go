package handlers

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/inkless/backend/internal/db"
	"github.com/inkless/backend/internal/db/models"
	"github.com/labstack/echo/v4"
)

// IdentityHandler handles identity-related operations
type IdentityHandler struct{}

// NewIdentityHandler creates a new identity handler
func NewIdentityHandler() *IdentityHandler {
	return &IdentityHandler{}
}

// VerifyRequest represents the NIMC verification request
type VerifyRequest struct {
	VNIN         string `json:"vNIN" validate:"required"`
	ConsentToken string `json:"consent_token" validate:"required"`
}

// VerifyResponse represents the verification response
type VerifyResponse struct {
	Status      string            `json:"status"`
	DID         string            `json:"did"`
	UserProfile map[string]string `json:"user_profile,omitempty"`
}

// Verify handles POST /api/v1/identity/verify
// For MVP, this is a MOCK implementation. Will be replaced with real NIMC API integration.
func (h *IdentityHandler) Verify(c echo.Context) error {
	var req VerifyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	if req.VNIN == "" || req.ConsentToken == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "vNIN and consent_token are required",
		})
	}

	// MOCK: Generate a DID based on the vNIN
	// In production, this would call the NIMC vNIN API
	userID := uuid.New()
	did := "did:inkless:" + userID.String()[:8]

	// Create audit log entry
	ipAddr := c.RealIP()
	auditLog := models.AuditLog{
		UserID:     userID,
		ActionType: "identity_verify",
		IPAddress:  &ipAddr,
		Timestamp:  time.Now(),
	}

	// Note: In a real implementation, we'd check if user exists first
	// and only create if new, then update the audit log with the real user ID
	_ = db.DB.Create(&auditLog)

	return c.JSON(http.StatusOK, VerifyResponse{
		Status: "verified",
		DID:    did,
		UserProfile: map[string]string{
			"verified_at": time.Now().Format(time.RFC3339),
			"mock_mode":   "true",
		},
	})
}
