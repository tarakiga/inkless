"use client";

import { Scale } from "lucide-react";
import { TermsContent } from "@/components/molecules/LegalContent";

export default function TermsPage() {
    return (
        <div className="space-y-8">
            <div className="border-b border-slate-200 dark:border-white/10 pb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                    <Scale className="h-4 w-4" />
                    Terms of Service
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                    Terms of Service
                </h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Last updated: December 2025
                </p>
            </div>

            <div className="text-slate-600 dark:text-slate-300">
                <TermsContent />
            </div>
        </div>
    );
}
