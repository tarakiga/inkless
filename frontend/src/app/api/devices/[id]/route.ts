import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8080";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const response = await fetch(`${BACKEND_URL}/api/v1/devices/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const data = await response.json();
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Remove device proxy error:", error);
        return NextResponse.json(
            { error: "Failed to remove device" },
            { status: 500 }
        );
    }
}
