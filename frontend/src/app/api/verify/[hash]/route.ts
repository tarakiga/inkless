import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ hash: string }> }
) {
    try {
        const { hash } = await params;
        const response = await fetch(`${BACKEND_URL}/api/v1/verify/${hash}`);
        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error("Verify proxy error:", error);
        return NextResponse.json(
            { error: "Failed to verify document" },
            { status: 500 }
        );
    }
}
