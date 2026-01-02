"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Check, Copy } from "lucide-react";

interface AnchorResponse {
    txHash: string;
    anchoredAt: string;
    docId: string;
    status: string;
}

interface SignerInfo {
    did: string;
    timestamp: string;
    txHash?: string;
}

interface TransactionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    anchorResult: AnchorResponse;
    docHash: string;
    signers?: SignerInfo[];
}

export const TransactionDetailsModal = ({
    isOpen,
    onClose,
    anchorResult,
    docHash,
    signers,
}: TransactionDetailsModalProps) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-lg bg-gradient-to-br from-slate-900/95 to-slate-800/95 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {/* Header */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 rounded-xl bg-emerald-500/20">
                                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-white">Transaction Confirmed</h3>
                                <p className="text-sm text-slate-400">Signature anchored on blockchain</p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            {/* Transaction Hash */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Transaction Hash</span>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(anchorResult.txHash);
                                            setCopiedField('txHash');
                                            setTimeout(() => setCopiedField(null), 2000);
                                        }}
                                        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        {copiedField === 'txHash' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-sm font-mono text-emerald-400 break-all">{anchorResult.txHash}</p>
                            </div>

                            {/* Document Hash */}
                            <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Document Hash</span>
                                    <button
                                        onClick={() => {
                                            if (docHash) {
                                                navigator.clipboard.writeText(docHash);
                                                setCopiedField('docHash');
                                                setTimeout(() => setCopiedField(null), 2000);
                                            }
                                        }}
                                        className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                    >
                                        {copiedField === 'docHash' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-sm font-mono text-slate-300 break-all">{docHash}</p>
                            </div>

                            {/* Metadata Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">Anchored At</span>
                                    <p className="text-sm text-white">{new Date(anchorResult.anchoredAt).toLocaleString()}</p>
                                </div>
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-2">Network</span>
                                    <p className="text-sm text-white">Polygon Amoy Testnet</p>
                                    <p className="text-xs text-slate-500">Chain ID: 80002</p>
                                </div>
                            </div>

                            {/* Multi-Party Signers Section */}
                            {signers && signers.length > 0 && (
                                <div className="bg-slate-800/50 rounded-xl p-4 border border-white/5">
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Verified Signers</span>
                                        {signers.length > 1 && (
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                                                Multi-Sig ({signers.length})
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {signers.map((signer, index) => (
                                            <div key={index} className="flex items-center justify-between text-sm py-2 border-b border-white/5 last:border-0">
                                                <span className="font-mono text-slate-300 truncate max-w-[200px]" title={signer.did}>{signer.did}</span>
                                                <span className="text-xs text-slate-500">{new Date(signer.timestamp).toLocaleDateString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="mt-6 pt-4 border-t border-white/10">
                            <p className="text-xs text-slate-400 text-center">
                                ✅ This signature is permanently recorded on the blockchain and can be independently verified.
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
