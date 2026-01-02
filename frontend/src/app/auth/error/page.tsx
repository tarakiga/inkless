"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, RefreshCw } from "lucide-react";
import { Suspense } from "react";

const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration. Please contact support.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    OAuthSignin: "Error in constructing an authorization URL.",
    OAuthCallback: "Error in handling the response from Google.",
    OAuthCreateAccount: "Could not create user account.",
    EmailCreateAccount: "Could not create user account via email.",
    Callback: "Error in the OAuth callback handler.",
    OAuthAccountNotLinked: "This email is already associated with another account.",
    Default: "An unexpected error occurred during sign in.",
};

function AuthErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get("error") || "Default";
    const errorMessage = errorMessages[error] || errorMessages.Default;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full"
            >
                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-white/10 p-8 shadow-xl text-center">
                    {/* Error Icon */}
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>

                    {/* Error Title */}
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        Authentication Error
                    </h1>

                    {/* Error Code */}
                    <p className="text-sm text-red-500 font-mono mb-4">
                        Error: {error}
                    </p>

                    {/* Error Message */}
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                        {errorMessage}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3">
                        <Link
                            href="/auth/login"
                            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Try Again
                        </Link>
                        <Link
                            href="/"
                            className="w-full px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    If this problem persists, please{" "}
                    <a href="mailto:support@inkless.io" className="text-blue-500 hover:underline">
                        contact support
                    </a>
                </p>
            </motion.div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
            </div>
        }>
            <AuthErrorContent />
        </Suspense>
    );
}
