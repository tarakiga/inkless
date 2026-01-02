package handlers

import (
	"fmt"
	"net/http"
	"time"

	"github.com/inkless/backend/internal/db"
	"github.com/inkless/backend/internal/db/models"
	"github.com/labstack/echo/v4"
)

type StatsHandler struct{}

func NewStatsHandler() *StatsHandler {
	return &StatsHandler{}
}

type DashboardStatsResponse struct {
	Velocity      StatMetric `json:"velocity"`
	SecurityScore StatMetric `json:"securityScore"`
	NetworkStatus StatMetric `json:"networkStatus"`
}

type StatMetric struct {
	Value  string `json:"value"`
	Change string `json:"change"`
	Trend  string `json:"trend"` // "up", "down", "neutral"
}

// GetDashboardStats calculates real-time stats for the user
func (h *StatsHandler) GetDashboardStats(c echo.Context) error {
	// Demo user
	var user models.User
	if err := db.DB.Where("did_address = ?", "did:inkless:demo").First(&user).Error; err != nil {
		// If user doesn't exist yet, return defaults
		return c.JSON(http.StatusOK, getDefaultStats())
	}

	// 1. Calculate Signature Velocity
	var currentMonthCount int64
	var lastMonthCount int64
	now := time.Now()
	thirtyDaysAgo := now.AddDate(0, 0, -30)
	sixtyDaysAgo := now.AddDate(0, 0, -60)

	db.DB.Model(&models.SignatureMetadata{}).
		Where("signer_id = ? AND created_at >= ?", user.ID, thirtyDaysAgo).
		Count(&currentMonthCount)

	db.DB.Model(&models.SignatureMetadata{}).
		Where("signer_id = ? AND created_at >= ? AND created_at < ?", user.ID, sixtyDaysAgo, thirtyDaysAgo).
		Count(&lastMonthCount)

	velocityChange := 0.0
	if lastMonthCount > 0 {
		velocityChange = (float64(currentMonthCount-lastMonthCount) / float64(lastMonthCount)) * 100
	} else if currentMonthCount > 0 {
		velocityChange = 100.0 // from 0 to something is 100% "growth" conceptually for UI
	}

	velocityMsg := fmt.Sprintf("%+d%%", int(velocityChange)) // e.g. "+24%"
	velocityTrend := "neutral"
	if velocityChange > 0 {
		velocityTrend = "up"
	} else if velocityChange < 0 {
		velocityTrend = "down"
	}

	// 2. Calculate Security Score
	// Base 50. Verified +40. Email +10.
	score := 50
	if user.VNINHash != nil { // In real app, check isVerified logic
		score += 40
	}
	// For demo, we assumed checking sig count for 'verification' in profile.go, but let's stick to valid fields
	// If user has > 0 signatures, we consider them 'active' and give points
	if currentMonthCount+lastMonthCount > 0 {
		score += 10
	}
	// If email is present
	if user.Email != "" && user.Email != "demo@inkless.app" { // slightly stricter
		score += 40 // simple logic for now
	} else {
		score += 30 // demo user base
	}

	if score > 100 {
		score = 100
	}

	securityMsg := "Optimal"
	if score < 70 {
		securityMsg = "Complete Setup"
	}
	if score < 50 {
		securityMsg = "At Risk"
	}

	// 3. Network Status (Mock/Hardcoded for now as it's global)

	return c.JSON(http.StatusOK, DashboardStatsResponse{
		Velocity: StatMetric{
			Value:  fmt.Sprintf("%d", currentMonthCount),
			Change: velocityMsg,
			Trend:  velocityTrend,
		},
		SecurityScore: StatMetric{
			Value:  fmt.Sprintf("%d/100", score),
			Change: securityMsg,
			Trend:  "up",
		},
		NetworkStatus: StatMetric{
			Value:  "Polygon PoS",
			Change: "Operational",
			Trend:  "up",
		},
	})
}

func getDefaultStats() DashboardStatsResponse {
	return DashboardStatsResponse{
		Velocity:      StatMetric{Value: "0", Change: "0%", Trend: "neutral"},
		SecurityScore: StatMetric{Value: "50/100", Change: "Setup Required", Trend: "neutral"},
		NetworkStatus: StatMetric{Value: "Polygon PoS", Change: "Operational", Trend: "up"},
	}
}
