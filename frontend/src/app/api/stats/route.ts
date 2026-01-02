import { NextResponse } from "next/server";

const API_Base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function GET() {
    try {
        const response = await fetch(`${API_Base}/stats`, {
            cache: "no-store"
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: "Failed to fetch stats" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
