"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
    Shield,
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    FileText,
    Calendar,
    Hash,
    ArrowLeft,
    User,
    Clock,
    Upload,
    File,
    X,
    Keyboard
} from "lucide-react";
import { inklessAPI, VerifyResponse } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useCrypto } from "@/hooks/useCrypto";

export default function VerifyPage() {
    const [docHash, setDocHash] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<VerifyResponse | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [inputMode, setInputMode] = useState<"drop" | "manual">("drop");
    const [isDragging, setIsDragging] = useState(false);
    const [processingFile, setProcessingFile] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { hashDocument } = useCrypto();

    const handleVerifyHash = async (hash: string) => {
        if (!hash.trim()) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await inklessAPI.verify(hash.trim());
            setResult(response);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Verification failed");
        } finally {
            setIsLoading(false);
            setProcessingFile(null);
        }
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleVerifyHash(docHash);
    };

    const processFile = async (file: File) => {
        setProcessingFile(file.name);
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            // Client-side Hashing (Zero-Knowledge)
            const hash = await hashDocument(file);
            setDocHash(hash); // Populate for visibility
            await handleVerifyHash(hash);
        } catch (err) {
            setError("Failed to process file. Please try again.");
            setIsLoading(false);
            setProcessingFile(null);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            </div>

            <div className="relative min-h-screen flex flex-col items-center justify-center p-4">
                {/* Back Button */}
                <div className="absolute top-6 left-6 md:top-10 md:left-10">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="text-sm font-medium">Back to Home</span>
                    </Link>
                </div>

                <div className="w-full max-w-xl">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-10"
                    >
                        <div className="inline-flex items-center gap-2 mb-6">
                            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 dark:from-blue-500/20 dark:to-indigo-500/20 border border-blue-500/10">
                                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">
                            Verify Document
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-sm mx-auto">
                            Drag & drop a file to verify its authenticity securely on your device.
                        </p>
                    </motion.div>

                    {/* Verification Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-2 shadow-2xl shadow-slate-200/50 dark:shadow-none transition-all duration-300"
                    >
                        <div className="p-2">
                            <div className="relative">
                                {/* Mode Switcher */}
                                <div className="absolute top-0 right-0 z-10 p-2">
                                    <button
                                        onClick={() => setInputMode(inputMode === "drop" ? "manual" : "drop")}
                                        className="p-2 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-2"
                                        title={inputMode === "drop" ? "Switch to Manual Hash Input" : "Switch to File Upload"}
                                    >
                                        {inputMode === "drop" ? <Keyboard className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
                                        <span className="hidden sm:inline">{inputMode === "drop" ? "Manual Input" : "Upload File"}</span>
                                    </button>
                                </div>

                                <div className="p-4 md:p-6">
                                    <AnimatePresence mode="wait">
                                        {inputMode === "drop" ? (
                                            <motion.div
                                                key="drop"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <div
                                                    onClick={() => !isLoading && fileInputRef.current?.click()}
                                                    onDragOver={handleDragOver}
                                                    onDragLeave={handleDragLeave}
                                                    onDrop={handleDrop}
                                                    className={cn(
                                                        "relative border-2 border-dashed rounded-2xl p-12 md:p-16 text-center cursor-pointer transition-all duration-300 group",
                                                        isDragging
                                                            ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10 scale-[1.02]"
                                                            : "border-slate-200 dark:border-white/10 hover:border-blue-400 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5",
                                                        isLoading && "pointer-events-none opacity-50"
                                                    )}
                                                >
                                                    <input
                                                        ref={fileInputRef}
                                                        type="file"
                                                        accept="*/*"
                                                        onChange={handleFileSelect}
                                                        className="hidden"
                                                    />

                                                    <div className="mb-6 relative">
                                                        <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                        <Upload className={cn(
                                                            "h-16 w-16 mx-auto relative transition-colors duration-300",
                                                            isDragging ? "text-blue-500" : "text-slate-300 dark:text-slate-600 group-hover:text-blue-500"
                                                        )} />
                                                    </div>

                                                    {processingFile ? (
                                                        <div className="space-y-2">
                                                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-blue-500" />
                                                            <p className="font-medium text-slate-900 dark:text-white">Hashing & Verifying...</p>
                                                            <p className="text-sm text-slate-500">{processingFile}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <p className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                                                                Drop your document here
                                                            </p>
                                                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                                                Supports any file type • No upload limit (Client-side Hashing)
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="manual"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.2 }}
                                                className="py-8"
                                            >
                                                <form onSubmit={handleManualSubmit} className="relative">
                                                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                                                        <Hash className="h-5 w-5 text-slate-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={docHash}
                                                        onChange={(e) => setDocHash(e.target.value)}
                                                        placeholder="Paste document hash (e.g. 0x7f...)"
                                                        className="w-full pl-12 pr-14 py-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-white/10 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-mono text-sm"
                                                        spellCheck={false}
                                                    />
                                                    <button
                                                        type="submit"
                                                        disabled={isLoading || !docHash.trim()}
                                                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:hover:bg-blue-600"
                                                    >
                                                        {isLoading ? (
                                                            <Loader2 className="h-5 w-5 animate-spin" />
                                                        ) : (
                                                            <Search className="h-5 w-5" />
                                                        )}
                                                    </button>
                                                </form>
                                                <p className="text-center text-sm text-slate-400 mt-4">
                                                    Paste the SHA-3 hash of your document to verify manually.
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        </div>

                        {/* Results Area */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-8 pb-8"
                                >
                                    <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-4">
                                        <div className="p-2 rounded-full bg-red-500/10 shrink-0">
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-red-600 dark:text-red-400 text-sm">Verification Failed</h3>
                                            <p className="text-slate-600 dark:text-slate-400 text-sm">{error}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="px-8 pb-8"
                                >
                                    <div className={cn(
                                        "rounded-2xl overflow-hidden border",
                                        result.isValid
                                            ? "bg-emerald-500/5 border-emerald-500/20 dark:bg-emerald-500/10"
                                            : "bg-red-500/5 border-red-500/20 dark:bg-red-500/10"
                                    )}>
                                        {/* Result Header */}
                                        <div className="p-6 border-b border-black/5 dark:border-white/5 flex items-center gap-4">
                                            <div className={cn(
                                                "p-3 rounded-xl shrink-0",
                                                result.isValid ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-red-500/10 text-red-600 dark:text-red-400"
                                            )}>
                                                {result.isValid ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                                            </div>
                                            <div>
                                                <h3 className={cn(
                                                    "font-bold text-lg",
                                                    result.isValid ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                                                )}>
                                                    {result.isValid ? "Valid Signature" : "Invalid Signature"}
                                                </h3>
                                                <p className="text-slate-600 dark:text-slate-400 text-sm">
                                                    {result.status}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        {result.isValid && (
                                            <div className="p-6 grid gap-6 md:grid-cols-2">
                                                {result.signer && (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                            <User className="h-3.5 w-3.5" />
                                                            Signer Identity
                                                        </div>
                                                        <div className="p-3 bg-white dark:bg-slate-950/50 rounded-lg border border-slate-200 dark:border-white/10 font-mono text-sm text-slate-900 dark:text-white break-all">
                                                            {result.signer}
                                                        </div>
                                                    </div>
                                                )}

                                                {result.timestamp && (
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                            <Clock className="h-3.5 w-3.5" />
                                                            Timestamp
                                                        </div>
                                                        <p className="text-slate-900 dark:text-white font-medium">
                                                            {new Date(result.timestamp).toLocaleString(undefined, {
                                                                dateStyle: 'long',
                                                                timeStyle: 'medium'
                                                            })}
                                                        </p>
                                                    </div>
                                                )}

                                                {result.ledgerTx && (
                                                    <div className="col-span-full space-y-1">
                                                        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                            <Shield className="h-3.5 w-3.5" />
                                                            Blockchain Proof
                                                        </div>
                                                        <a
                                                            href={`https://amoy.polygonscan.com/tx/${result.ledgerTx}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center justify-between p-3 bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 rounded-lg group transition-colors"
                                                        >
                                                            <span className="font-mono text-sm text-blue-600 dark:text-blue-400 truncate mr-4">
                                                                {result.ledgerTx}
                                                            </span>
                                                            <ArrowLeft className="h-4 w-4 rotate-180 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Trust Indicators */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 flex justify-center gap-6 text-slate-400"
                    >
                        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider opacity-60">
                            <Shield className="h-4 w-4" />
                            Zero-Knowledge Verification
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
