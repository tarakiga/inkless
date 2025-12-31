package handlers

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/inkless/backend/internal/db"
	"github.com/inkless/backend/internal/db/models"
	"github.com/inkless/backend/internal/ledger"
	"github.com/labstack/echo/v4"
)

// SignatureHandler handles signature-related operations
type SignatureHandler struct{}

// NewSignatureHandler creates a new signature handler
func NewSignatureHandler() *SignatureHandler {
	return &SignatureHandler{}
}

// AnchorRequest represents the signature anchoring request
type AnchorRequest struct {
	DocHash          string `json:"docHash" validate:"required"`
	PQCSignature     []byte `json:"pqcSignature" validate:"required"`
	HardwareID       string `json:"hardwareID" validate:"required"`
	SignerDID        string `json:"signerDID" validate:"required"`
	DocumentCategory string `json:"documentCategory"`
	FileName         string `json:"fileName"`
	FileSize         string `json:"fileSize"`
	MimeType         string `json:"mimeType"`
}

// AnchorResponse represents the anchoring response
type AnchorResponse struct {
	TxHash     string `json:"txHash"`
	AnchoredAt string `json:"anchoredAt"`
	DocID      string `json:"docId"`
	Status     string `json:"status"`
}

// Anchor handles POST /api/v1/signatures/anchor
func (h *SignatureHandler) Anchor(c echo.Context) error {
	var req AnchorRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	if req.DocHash == "" || len(req.PQCSignature) == 0 || req.HardwareID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "docHash, pqcSignature, and hardwareID are required",
		})
	}

	// Default category if missing
	if req.DocumentCategory == "" {
		req.DocumentCategory = "general_contract"
	}

	// Find or create the user first (needed for duplicate check)
	var user models.User
	if err := db.DB.Where("d_id_address = ?", req.SignerDID).First(&user).Error; err != nil {
		// Create a mock user if not found
		mockVNINHash := "mock_vnin_hash_" + uuid.New().String()[:8]
		user = models.User{
			DIDAddress:   req.SignerDID,
			VNINHash:     &mockVNINHash,
			DevicePubKey: "mock_pubkey_" + req.HardwareID,
		}
		if err := db.DB.Create(&user).Error; err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": "Failed to create user",
			})
		}
	}

	// Check if THIS SIGNER has already signed THIS document (allow multi-party signing)
	var existingSig models.SignatureMetadata
	if err := db.DB.Where("doc_hash = ? AND signer_id = ?", req.DocHash, user.ID).First(&existingSig).Error; err == nil {
		return c.JSON(http.StatusConflict, map[string]string{
			"error":  "You have already signed this document",
			"txHash": *existingSig.LedgerTxHash,
		})
	}

	// Submit to blockchain (real or mock)
	var txHash string
	anchoredAt := time.Now()

	if ledger.IsConnected() {
		// Real blockchain: submit to InklessRegistry contract
		ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
		defer cancel()

		realTxHash, err := ledger.Global.AnchorSignature(ctx, req.DocHash, req.PQCSignature, req.HardwareID)
		if err != nil {
			return c.JSON(http.StatusInternalServerError, map[string]string{
				"error": fmt.Sprintf("Blockchain anchoring failed: %v", err),
			})
		}
		txHash = realTxHash
	} else {
		// Fallback: generate mock transaction hash
		txHash = "0x" + uuid.New().String()[:32]
	}

	// User already created/fetched above before duplicate check

	// Create signature metadata
	sigMetadata := models.SignatureMetadata{
		DocHash:          req.DocHash,
		SignerID:         user.ID, // Use the actual user ID
		DocumentCategory: req.DocumentCategory,
		FileName:         req.FileName,
		FileSize:         req.FileSize,
		MimeType:         req.MimeType,
		LedgerTxHash:     &txHash,
		Status:           "anchored",
		HardwareID:       req.HardwareID,
	}

	if err := db.DB.Create(&sigMetadata).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to record signature",
		})
	}

	// Create audit log
	ipAddr := c.RealIP()
	metadata := fmt.Sprintf(`{"docHash": "%s", "hardwareID": "%s", "category": "%s"}`, req.DocHash, req.HardwareID, req.DocumentCategory)
	auditLog := models.AuditLog{
		UserID:     sigMetadata.SignerID,
		ActionType: "signature_anchor",
		IPAddress:  &ipAddr,
		Metadata:   &metadata,
		Timestamp:  anchoredAt,
	}
	db.DB.Create(&auditLog)

	return c.JSON(http.StatusOK, AnchorResponse{
		TxHash:     txHash,
		AnchoredAt: anchoredAt.Format(time.RFC3339),
		DocID:      sigMetadata.ID.String(),
		Status:     "anchored",
	})
}

// VerifyResponse represents the verification response
type SignerInfo struct {
	DID       string `json:"did"`
	Timestamp string `json:"timestamp"`
	TxHash    string `json:"txHash,omitempty"`
}

type SignatureVerifyResponse struct {
	IsValid     bool         `json:"isValid"`
	Signer      string       `json:"signer,omitempty"`    // Kept for backwards compatibility (first signer)
	Signers     []SignerInfo `json:"signers"`             // All signers for multi-party
	SignerCount int          `json:"signerCount"`         // Total number of signers
	Timestamp   string       `json:"timestamp,omitempty"` // First signature timestamp
	LedgerTx    string       `json:"ledgerTx,omitempty"`  // First ledger tx
	Status      string       `json:"status"`
}

// Verify handles GET /api/v1/verify/:docHash
func (h *SignatureHandler) Verify(c echo.Context) error {
	docHash := c.Param("docHash")
	if docHash == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "docHash is required",
		})
	}

	// Fetch ALL signatures for this document (multi-party support)
	var signatures []models.SignatureMetadata
	if err := db.DB.Preload("Signer").Where("doc_hash = ?", docHash).Order("created_at asc").Find(&signatures).Error; err != nil || len(signatures) == 0 {
		return c.JSON(http.StatusNotFound, SignatureVerifyResponse{
			IsValid: false,
			Status:  "not_found",
		})
	}

	// Create audit log for the first signer
	ipAddr := c.RealIP()
	auditLog := models.AuditLog{
		UserID:     signatures[0].SignerID,
		ActionType: "signature_verify",
		IPAddress:  &ipAddr,
		Timestamp:  time.Now(),
	}
	db.DB.Create(&auditLog)

	// Build list of all signers
	signers := make([]SignerInfo, len(signatures))
	for i, sig := range signatures {
		txHash := ""
		if sig.LedgerTxHash != nil {
			txHash = *sig.LedgerTxHash
		}
		signers[i] = SignerInfo{
			DID:       sig.Signer.DIDAddress,
			Timestamp: sig.CreatedAt.Format(time.RFC3339),
			TxHash:    txHash,
		}
	}

	// Get first signature for backwards compatibility
	firstSig := signatures[0]
	ledgerTx := ""
	if firstSig.LedgerTxHash != nil {
		ledgerTx = *firstSig.LedgerTxHash
	}

	return c.JSON(http.StatusOK, SignatureVerifyResponse{
		IsValid:     true,
		Signer:      firstSig.Signer.DIDAddress,
		Signers:     signers,
		SignerCount: len(signers),
		Timestamp:   firstSig.CreatedAt.Format(time.RFC3339),
		LedgerTx:    ledgerTx,
		Status:      firstSig.Status,
	})
}

// RecentSignatureResponse represents the recent signature list item
type RecentSignatureResponse struct {
	ID               string `json:"id"`
	FileName         string `json:"fileName"`
	FileSize         string `json:"fileSize"`
	MimeType         string `json:"mimeType"`
	DocumentCategory string `json:"documentCategory"`
	SignDate         string `json:"signDate"`
	Status           string `json:"status"`
	SignerDID        string `json:"signerDid"`
	TxHash           string `json:"txHash,omitempty"`
	DocHash          string `json:"docHash"`
}

// GetRecent handles GET /api/v1/signatures/recent
func (h *SignatureHandler) GetRecent(c echo.Context) error {
	var signatures []models.SignatureMetadata
	// Fetch last 10 signatures, preload Signer for DID
	if err := db.DB.Preload("Signer").Order("created_at desc").Limit(10).Find(&signatures).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to fetch signatures",
		})
	}

	response := make([]RecentSignatureResponse, len(signatures))
	for i, sig := range signatures {
		signerDID := ""
		if sig.Signer.DIDAddress != "" {
			signerDID = sig.Signer.DIDAddress
		}

		txHash := ""
		if sig.LedgerTxHash != nil {
			txHash = *sig.LedgerTxHash
		}

		// Use stored metadata, fallback to defaults if missing (for old records)
		fileName := sig.FileName
		if fileName == "" {
			fileName = fmt.Sprintf("Document_%s.pdf", sig.DocHash[:8])
		}
		fileSize := sig.FileSize
		if fileSize == "" {
			fileSize = "Unknown"
		}

		response[i] = RecentSignatureResponse{
			ID:               sig.ID.String(),
			FileName:         fileName,
			FileSize:         fileSize,
			MimeType:         sig.MimeType,
			DocumentCategory: sig.DocumentCategory,
			SignDate:         sig.CreatedAt.Format(time.RFC3339),
			Status:           sig.Status,
			SignerDID:        signerDID,
			TxHash:           txHash,
			DocHash:          sig.DocHash,
		}
	}

	return c.JSON(http.StatusOK, response)
}
