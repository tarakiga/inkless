package handlers

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/inkless/backend/internal/db"
	"github.com/inkless/backend/internal/db/models"
	"github.com/labstack/echo/v4"
)

// OfflineHandler handles offline signature synchronization
type OfflineHandler struct{}

// NewOfflineHandler creates a new offline handler
func NewOfflineHandler() *OfflineHandler {
	return &OfflineHandler{}
}

// SyncRequest represents a single offline signature to sync
type OfflineSyncItem struct {
	DocHash      string    `json:"docHash" validate:"required"`
	PQCSignature []byte    `json:"pqcSignature" validate:"required"`
	HardwareID   string    `json:"hardwareID" validate:"required"`
	LocalTS      time.Time `json:"localTimestamp" validate:"required"`
	SignerDID    string    `json:"signerDID" validate:"required"`
}

// SyncRequest represents the offline sync request
type SyncRequest struct {
	Signatures []OfflineSyncItem `json:"signatures" validate:"required"`
}

// SyncResult represents the result of syncing a single signature
type SyncResult struct {
	DocHash string `json:"docHash"`
	Status  string `json:"status"` // synced, failed, already_exists
	TxHash  string `json:"txHash,omitempty"`
	Error   string `json:"error,omitempty"`
}

// SyncResponse represents the sync response
type SyncResponse struct {
	Processed int          `json:"processed"`
	Synced    int          `json:"synced"`
	Failed    int          `json:"failed"`
	Results   []SyncResult `json:"results"`
}

// Sync handles POST /api/v1/offline/sync
// Processes QR-based offline signatures that were made without internet
func (h *OfflineHandler) Sync(c echo.Context) error {
	var req SyncRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	if len(req.Signatures) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "No signatures to sync",
		})
	}

	results := make([]SyncResult, 0, len(req.Signatures))
	synced := 0
	failed := 0

	for _, sig := range req.Signatures {
		result := SyncResult{DocHash: sig.DocHash}

		// Check if already exists
		var existing models.SignatureMetadata
		if err := db.DB.Where("doc_hash = ?", sig.DocHash).First(&existing).Error; err == nil {
			result.Status = "already_exists"
			if existing.LedgerTxHash != nil {
				result.TxHash = *existing.LedgerTxHash
			}
			results = append(results, result)
			continue
		}

		// Store offline signature for processing
		offlineSig := models.OfflineSignature{
			DocHash:      sig.DocHash,
			PQCSignature: sig.PQCSignature,
			HardwareID:   sig.HardwareID,
			LocalTS:      sig.LocalTS,
			SyncStatus:   "pending",
		}

		if err := db.DB.Create(&offlineSig).Error; err != nil {
			result.Status = "failed"
			result.Error = "Failed to store signature"
			failed++
			results = append(results, result)
			continue
		}

		// TODO: Queue for blockchain submission via Redis
		// For MVP, mock immediate anchoring
		mockTxHash := "0x" + uuid.New().String()[:32]
		now := time.Now()

		sigMetadata := models.SignatureMetadata{
			DocHash:      sig.DocHash,
			SignerID:     uuid.New(), // In production, look up from DID
			LedgerTxHash: &mockTxHash,
			Status:       "anchored",
			HardwareID:   sig.HardwareID,
		}

		if err := db.DB.Create(&sigMetadata).Error; err != nil {
			result.Status = "failed"
			result.Error = "Failed to anchor signature"
			failed++
		} else {
			// Update offline signature status
			db.DB.Model(&offlineSig).Updates(map[string]interface{}{
				"sync_status": "synced",
				"synced_at":   now,
			})

			result.Status = "synced"
			result.TxHash = mockTxHash
			synced++
		}

		results = append(results, result)
	}

	return c.JSON(http.StatusOK, SyncResponse{
		Processed: len(req.Signatures),
		Synced:    synced,
		Failed:    failed,
		Results:   results,
	})
}

// GetPendingCount handles GET /api/v1/offline/pending
// Returns count of pending offline signatures for the user
func (h *OfflineHandler) GetPendingCount(c echo.Context) error {
	var count int64
	db.DB.Model(&models.OfflineSignature{}).Where("sync_status = ?", "pending").Count(&count)

	return c.JSON(http.StatusOK, map[string]int64{
		"pending": count,
	})
}
