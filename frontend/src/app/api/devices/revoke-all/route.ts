import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function POST() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/devices/revoke-all`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
        });
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Revoke all devices proxy error:", error);
        return NextResponse.json(
            { error: "Failed to revoke devices" },
            { status: 500 }
        );
    }
}
