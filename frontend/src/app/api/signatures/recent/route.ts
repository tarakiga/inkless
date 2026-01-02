import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET() {
    try {
        const response = await fetch(`${BACKEND_URL}/api/v1/signatures/recent`);
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Recent signatures proxy error:", error);
        return NextResponse.json(
            { error: "Failed to fetch recent signatures" },
            { status: 500 }
        );
    }
}
