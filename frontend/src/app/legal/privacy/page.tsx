"use client";

import { Shield } from "lucide-react";
import { PrivacyContent } from "@/components/molecules/LegalContent";

export default function PrivacyPage() {
    return (
        <div className="space-y-8">
            <div className="border-b border-slate-200 dark:border-white/10 pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                    <Shield className="h-4 w-4" />
                    Privacy Policy
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Privacy Policy
                </h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Last updated: December 2025
                </p>
            </div>

            <div className="text-slate-600 dark:text-slate-300">
                <PrivacyContent />
            </div>
        </div>
    );
}
