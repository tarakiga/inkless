"use client";

import { useState } from "react";
import { SecureZone } from "@/components/organisms/SecureZone";
import { Shield } from "lucide-react";

export default function EmbedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Minimal Header */}
            <div className="flex items-center gap-2 mb-6">
                <div className="p-1.5 rounded-lg bg-blue-500/20">
                    <Shield className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-white">
                    Powered by Inkless
                </span>
            </div>

            {/* Embeddable SecureZone */}
            <SecureZone />
        </div>
    );
}
