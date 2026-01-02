package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// User represents a registered user with their DID and device info
type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DIDAddress   string    `gorm:"uniqueIndex;not null"`
	VNINHash     *string   `gorm:"index"` // Nullable until NIMC verification
	DevicePubKey string    `gorm:"not null"`
	FullName     string    `gorm:"type:varchar(255)"`
	Email        string    `gorm:"type:varchar(255)"`
	CreatedAt    time.Time
	UpdatedAt    time.Time

	// Relationships
	AuditLogs  []AuditLog          `gorm:"foreignKey:UserID"`
	Signatures []SignatureMetadata `gorm:"foreignKey:SignerID"`
}

// AuditLog records user actions for compliance
type AuditLog struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;index"`
	ActionType string    `gorm:"not null"` // e.g., "identity_verify", "signature_anchor", "signature_verify"
	IPAddress  *string
	Metadata   *string `gorm:"type:jsonb"` // Additional action-specific data
	Timestamp  time.Time

	// Relationships
	User User `gorm:"foreignKey:UserID"`
}

// SignatureMetadata stores document signature metadata (NOT the document itself)
type SignatureMetadata struct {
	ID               uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DocHash          string    `gorm:"index;not null;uniqueIndex:idx_doc_signer"`           // SHA-3 hash of the document (composite key with SignerID)
	SignerID         uuid.UUID `gorm:"type:uuid;not null;index;uniqueIndex:idx_doc_signer"` // Composite unique with DocHash
	DocumentCategory string    `gorm:"not null;default:'general_contract'"`                 // Added for legal compliance
	FileName         string    `gorm:"type:varchar(255)"`                                   // Original filename
	FileSize         string    `gorm:"type:varchar(50)"`                                    // Human readable size
	MimeType         string    `gorm:"type:varchar(100)"`                                   // e.g. application/pdf
	LedgerTxHash     *string   `gorm:"index"`                                               // Blockchain transaction hash
	Status           string    `gorm:"default:pending"`                                     // pending, anchored, verified, revoked
	HardwareID       string    `gorm:"not null"`                                            // Hash of device TPM/Secure Enclave ID
	CreatedAt        time.Time
	UpdatedAt        time.Time

	// Relationships
	Signer User `gorm:"foreignKey:SignerID"`
}

// VerificationToken for sharing proof of signature
type VerificationToken struct {
	ID              uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DocHash         string    `gorm:"index;not null"`
	Expiry          time.Time `gorm:"not null"`
	VerificationURL string    `gorm:"not null"`
	AccessCount     int       `gorm:"default:0"`
	MaxAccess       *int      // Optional limit on verification attempts
	CreatedAt       time.Time
}

// OfflineSignature stores signatures made offline, pending sync
type OfflineSignature struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	DocHash      string    `gorm:"not null"`
	PQCSignature []byte    `gorm:"type:bytea;not null"` // Post-quantum signature bytes
	HardwareID   string    `gorm:"not null"`
	LocalTS      time.Time `gorm:"not null"`        // Timestamp when signed offline
	SyncStatus   string    `gorm:"default:pending"` // pending, synced, failed
	ErrorMessage *string
	CreatedAt    time.Time
	SyncedAt     *time.Time
}

// TrustedDevice stores user's registered devices
type TrustedDevice struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID     uuid.UUID `gorm:"type:uuid;not null;index"`
	DeviceName string    `gorm:"not null"`          // e.g., "iPhone 15 Pro"
	DeviceType string    `gorm:"not null"`          // mobile, desktop, tablet
	UserAgent  string    `gorm:"type:text"`         // Full user agent string
	IPAddress  string    `gorm:"type:varchar(45)"`  // IPv4 or IPv6
	Location   string    `gorm:"type:varchar(100)"` // Derived from IP, e.g., "Lagos, NG"
	LastSeenAt time.Time
	IsActive   bool `gorm:"default:true"`
	CreatedAt  time.Time
	UpdatedAt  time.Time

	// Relationships
	User User `gorm:"foreignKey:UserID"`
}

// UserPreferences stores user settings like theme and notifications
type UserPreferences struct {
	ID                 uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
	UserID             uuid.UUID `gorm:"type:uuid;not null;uniqueIndex"`
	Theme              string    `gorm:"type:varchar(20);default:'dark'"` // system, dark, light
	NotifyOnSign       bool      `gorm:"default:true"`
	NotifyOnNewDevice  bool      `gorm:"default:true"`
	NotifyWeeklyReport bool      `gorm:"default:false"`
	CreatedAt          time.Time
	UpdatedAt          time.Time

	// Relationships
	User User `gorm:"foreignKey:UserID"`
}

// BeforeCreate hook for User
func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ID == uuid.Nil {
		u.ID = uuid.New()
	}
	return nil
}

// BeforeCreate hook for AuditLog
func (a *AuditLog) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	if a.Timestamp.IsZero() {
		a.Timestamp = time.Now()
	}
	return nil
}

// BeforeCreate hook for SignatureMetadata
func (s *SignatureMetadata) BeforeCreate(tx *gorm.DB) error {
	if s.ID == uuid.Nil {
		s.ID = uuid.New()
	}
	return nil
}

// BeforeCreate hook for VerificationToken
func (v *VerificationToken) BeforeCreate(tx *gorm.DB) error {
	if v.ID == uuid.Nil {
		v.ID = uuid.New()
	}
	return nil
}

// BeforeCreate hook for OfflineSignature
func (o *OfflineSignature) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

// BeforeCreate hook for TrustedDevice
func (d *TrustedDevice) BeforeCreate(tx *gorm.DB) error {
	if d.ID == uuid.Nil {
		d.ID = uuid.New()
	}
	return nil
}

// BeforeCreate hook for UserPreferences
func (p *UserPreferences) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
