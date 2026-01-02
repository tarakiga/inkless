"use client";

import { motion } from "framer-motion";
import { FileText, Check, Clock, AlertCircle, ExternalLink } from "lucide-react";
import { RecentSignature } from "@/lib/api";
import { getCategoryLabel } from "@/lib/documentCategories";
import { cn } from "@/lib/utils";

interface SignatureCardProps {
    signature: RecentSignature;
    layout?: "list" | "grid";
}

export function SignatureCard({ signature, layout = "list" }: SignatureCardProps) {
    const statusConfig = {
        anchored: {
            icon: Check,
            color: "text-emerald-400",
            bg: "bg-emerald-500/20",
            border: "border-emerald-500/20",
            label: "Anchored",
        },
        pending: {
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-500/20",
            border: "border-amber-500/20",
            label: "Pending",
        },
        failed: {
            icon: AlertCircle,
            color: "text-rose-400",
            bg: "bg-rose-500/20",
            border: "border-rose-500/20",
            label: "Failed",
        },
    };

    const status = statusConfig[signature.status as keyof typeof statusConfig] || statusConfig.pending;
    const StatusIcon = status.icon;

    const explorerUrl = signature.txHash
        ? `https://amoy.polygonscan.com/tx/${signature.txHash}`
        : null;

    if (layout === "grid") {
        return (
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative flex flex-col p-6 bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl hover:bg-slate-800/60 hover:border-white/10 transition-all shadow-xl shadow-black/20"
            >
                {/* Status Badge - Floating */}
                <div className={cn("absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md flex items-center gap-1.5 border", status.bg, status.color, status.border)}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {status.label}
                </div>

                {/* Icon & Type */}
                <div className="mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border border-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <FileText className="h-6 w-6 text-blue-400" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 mb-6">
                    <h3 className="text-lg font-semibold text-white leading-tight group-hover:text-blue-400 transition-colors line-clamp-2">
                        {signature.fileName}
                    </h3>
                    <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-2 py-1 rounded-lg bg-white/5 text-xs text-slate-400 border border-white/5">
                            {getCategoryLabel(signature.documentCategory)}
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-white/5 flex items-center justify-between text-sm">
                    <span className="text-slate-500 flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {new Date(signature.signDate).toLocaleDateString()}
                    </span>

                    {explorerUrl && (
                        <a
                            href={explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                        >
                            Ledger
                            <ExternalLink className="w-3 h-3" />
                        </a>
                    )}
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group flex items-center gap-4 p-4 bg-slate-900/20 backdrop-blur-sm border border-white/5 rounded-xl hover:bg-slate-800/50 hover:border-white/10 transition-all hover:shadow-lg"
        >
            {/* File icon */}
            <div className="p-3 rounded-xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <FileText className="h-5 w-5 text-blue-400" />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-5">
                    <p className="text-white font-medium truncate group-hover:text-blue-400 transition-colors">{signature.fileName}</p>
                    <p className="text-xs text-slate-500 md:hidden mt-1">{new Date(signature.signDate).toLocaleDateString()}</p>
                </div>

                <div className="hidden md:flex md:col-span-4 items-center gap-3 text-sm text-slate-400">
                    <span className="px-2 py-1 rounded bg-white/5 border border-white/5 text-xs">
                        {getCategoryLabel(signature.documentCategory)}
                    </span>
                </div>

                <div className="hidden md:block md:col-span-3 text-right text-sm text-slate-500">
                    {new Date(signature.signDate).toLocaleDateString()}
                </div>
            </div>

            {/* Status */}
            <div className={cn("hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border", status.bg, status.border)}>
                <StatusIcon className={cn("h-3.5 w-3.5", status.color)} />
                <span className={cn("text-xs font-semibold", status.color)}>
                    {status.label}
                </span>
            </div>

            {/* Explorer link */}
            {explorerUrl && (
                <a
                    href={explorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <ExternalLink className="h-4 w-4" />
                </a>
            )}
        </motion.div>
    );
}
