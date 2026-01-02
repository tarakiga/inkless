const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export interface AnchorRequest {
    docHash: string;
    pqcSignature: number[];
    hardwareID: string;
    signerDID: string;
    documentCategory: string;
    fileName?: string;
    fileSize?: string;
    mimeType?: string;
}

export interface AnchorResponse {
    txHash: string;
    anchoredAt: string;
    docId: string;
    status: string;
}

export interface SignerInfo {
    did: string;
    timestamp: string;
    txHash?: string;
}

export interface VerifyResponse {
    isValid: boolean;
    signer?: string;
    signers?: SignerInfo[];
    signerCount?: number;
    timestamp?: string;
    ledgerTx?: string;
    status: string;
}

export interface IdentityVerifyResponse {
    did: string;
    verified: boolean;
    timestamp: string;
}

export interface RecentSignature {
    id: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    documentCategory: string;
    signDate: string;
    status: string;
    signerDid: string;
    txHash?: string;
    docHash: string;
}

export interface TrustedDevice {
    id: string;
    deviceName: string;
    deviceType: string;
    location: string;
    lastSeenAt: string;
    isActive: boolean;
}

export interface UserProfile {
    did: string;
    name: string;
    email: string;
    isVerified: boolean;
}

class InklessAPI {
    private baseUrl: string;

    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    async anchor(data: AnchorRequest): Promise<AnchorResponse> {
        const response = await fetch("/api/signatures/anchor", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to anchor signature");
        }

        return response.json();
    }

    async verify(docHash: string): Promise<VerifyResponse> {
        const response = await fetch(`/api/verify/${docHash}`);
        return response.json();
    }

    async verifyIdentity(vnin: string, devicePubKey: string): Promise<IdentityVerifyResponse> {
        const response = await fetch(`${this.baseUrl}/identity/verify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vnin, devicePubKey }),
        });
        return response.json();
    }

    async getRecentSignatures(): Promise<RecentSignature[]> {
        const response = await fetch("/api/signatures/recent");
        if (!response.ok) {
            throw new Error("Failed to fetch recent signatures");
        }
        return response.json();
    }

    async getProfile(): Promise<UserProfile> {
        const response = await fetch("/api/profile");
        if (!response.ok) {
            throw new Error("Failed to fetch profile");
        }
        return response.json();
    }

    async getDevices(): Promise<TrustedDevice[]> {
        const response = await fetch("/api/devices");
        if (!response.ok) {
            throw new Error("Failed to fetch devices");
        }
        return response.json();
    }

    async registerDevice(deviceName: string, deviceType: string): Promise<TrustedDevice> {
        const response = await fetch("/api/devices", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ deviceName, deviceType }),
        });
        if (!response.ok) {
            throw new Error("Failed to register device");
        }
        return response.json();
    }

    async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
        const response = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error("Failed to update profile");
        }
        return response.json();
    }

    async removeDevice(deviceId: string): Promise<void> {
        const response = await fetch(`/api/devices/${deviceId}`, {
            method: "DELETE",
        });
        if (!response.ok) {
            throw new Error("Failed to remove device");
        }
    }

    async getPreferences(): Promise<UserPreferences> {
        const response = await fetch("/api/preferences");
        if (!response.ok) {
            throw new Error("Failed to fetch preferences");
        }
        return response.json();
    }

    async updatePreferences(data: Partial<UserPreferences>): Promise<UserPreferences> {
        const response = await fetch("/api/preferences", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            throw new Error("Failed to update preferences");
        }
        return response.json();
    }

    async revokeAllDevices(): Promise<{ message: string; devicesRevoked: number }> {
        const response = await fetch("/api/devices/revoke-all", {
            method: "POST",
        });
        if (!response.ok) {
            throw new Error("Failed to revoke devices");
        }
        return response.json();
    }

    async getAccountStats(): Promise<AccountStats> {
        // Fetch signature count from recent signatures
        const signatures = await this.getRecentSignatures();
        return {
            documentsCount: signatures.length,
            plan: "Free", // MVP - could be fetched from subscription API later
        };
    }

    async getDashboardStats(): Promise<DashboardStats> {
        const response = await fetch("/api/stats");
        if (!response.ok) {
            throw new Error("Failed to fetch dashboard stats");
        }
        return response.json();
    }
}

export interface UserPreferences {
    theme: string;
    notifyOnSign: boolean;
    notifyOnNewDevice: boolean;
    notifyWeeklyReport: boolean;
}

export interface AccountStats {
    documentsCount: number;
    plan: string;
}

export interface StatMetric {
    value: string;
    change: string;
    trend: "up" | "down" | "neutral";
}

export interface DashboardStats {
    velocity: StatMetric;
    securityScore: StatMetric;
    networkStatus: StatMetric;
}

export const inklessAPI = new InklessAPI();
