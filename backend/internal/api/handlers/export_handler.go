package handlers

import (
	"encoding/csv"
	"fmt"
	"net/http"
	"time"

	"github.com/inkless/backend/internal/db"
	"github.com/inkless/backend/internal/db/models"
	"github.com/labstack/echo/v4"
)

type ExportHandler struct{}

func NewExportHandler() *ExportHandler {
	return &ExportHandler{}
}

// ExportAuditTrail handles GET /api/v1/files/:docHash/audit-trail
func (h *ExportHandler) ExportAuditTrail(c echo.Context) error {
	docHash := c.Param("docHash")

	// 1. Find the signature metadata to check if document exists and get signer details if needed
	var sigMetadata models.SignatureMetadata
	if err := db.DB.Where("doc_hash = ?", docHash).First(&sigMetadata).Error; err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Document not found"})
	}

	// 2. Fetch audit logs.
	// We want logs where the metadata contains the docHash.
	// Since we are using JSONB (metadata field), we can use Postgres JSON operators or a text cast.
	// For MVP simplicity and safety across potentially different setups (though Env says Postgres),
	// we use a text search via "metadata LIKE %...%".
	var logs []models.AuditLog
	// Search for logs associated with the signer AND containing the docHash in metadata
	db.DB.Where("user_id = ? AND metadata::text LIKE ?", sigMetadata.SignerID, "%"+docHash+"%").Order("timestamp desc").Find(&logs)

	// 3. Set headers for CSV download
	filename := fmt.Sprintf("inkless_audit_trail_%s.csv", docHash[:8])
	c.Response().Header().Set("Content-Type", "text/csv; charset=utf-8")
	c.Response().Header().Set("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))

	writer := csv.NewWriter(c.Response().Writer)
	defer writer.Flush()

	// 4. Write CSV Header
	// Write UTF-8 BOM for Excel compatibility
	c.Response().Write([]byte{0xEF, 0xBB, 0xBF})
	writer.Write([]string{"Timestamp (UTC)", "Action Type", "Actor (User ID)", "IP Address", "Metadata Details"})

	// 5. Write Data Rows
	for _, log := range logs {
		meta := ""
		if log.Metadata != nil {
			meta = *log.Metadata
		}
		ip := ""
		if log.IPAddress != nil {
			ip = *log.IPAddress
		}

		writer.Write([]string{
			log.Timestamp.UTC().Format(time.RFC3339),
			log.ActionType,
			log.UserID.String(),
			ip,
			meta,
		})
	}

	return nil
}
