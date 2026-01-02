"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    Shield,
    CheckCircle2,
    Loader2,
    X,
    Lock,
    Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCrypto } from "@/hooks/useCrypto";
import { inklessAPI, AnchorResponse } from "@/lib/api";
import { DocumentCategorySelector } from "@/components/molecules/DocumentCategorySelector";
import { documentCategories } from "@/lib/documentCategories";
import { TransactionDetailsModal } from "@/components/molecules/TransactionDetailsModal";

interface SecureZoneProps {
    onSignComplete?: (result: AnchorResponse) => void;
}

export function SecureZone({ onSignComplete }: SecureZoneProps) {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [step, setStep] = useState<"upload" | "category" | "signing" | "complete">("upload");
    const [category, setCategory] = useState("general_contract");
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<AnchorResponse | null>(null);
    const [docHash, setDocHash] = useState<string>("");
    const [showDetails, setShowDetails] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const { generateKeys, signDocument, hashDocument } = useCrypto();

    const selectedCategory = documentCategories.find(c => c.id === category);
    const isRiskExcluded = selectedCategory?.warningLevel === "danger";

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
            setFile(droppedFile);
            setStep("category");
        }
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setStep("category");
        }
    }, []);

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleSign = async () => {
        if (!file || isRiskExcluded) return;

        setIsProcessing(true);
        setStep("signing");
        setError(null);

        try {
            // Step 1: Hash the document
            const hash = await hashDocument(file);
            setDocHash(hash);

            // Step 2: Generate keys
            const keys = await generateKeys();

            // Step 3: Sign the document
            const signature = await signDocument(hash, keys.privateKey);

            // Step 4: Create DID from public key
            const signerDID = `did:inkless:${keys.publicKey.substring(0, 16)}...`;

            // Step 5: Anchor to blockchain
            const anchorResult = await inklessAPI.anchor({
                docHash: hash,
                pqcSignature: Array.from(signature),
                hardwareID: `browser_${navigator.userAgent.substring(0, 32)}`,
                signerDID,
                documentCategory: category,
                fileName: file.name,
                fileSize: formatFileSize(file.size),
                mimeType: file.type || "application/octet-stream",
            });

            setResult(anchorResult);
            setStep("complete");
            onSignComplete?.(anchorResult);
        } catch (err) {
            console.error("Signing failed:", err);
            setError(err instanceof Error ? err.message : "Signing failed");
            setStep("category");
        } finally {
            setIsProcessing(false);
        }
    };

    const reset = () => {
        setFile(null);
        setStep("upload");
        setCategory("general_contract");
        setResult(null);
        setDocHash("");
        setError(null);
    };

    return (
        <>
            <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800/50 dark:to-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden shadow-lg dark:shadow-none">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5 pointer-events-none" />

                {/* Header */}
                <div className="relative flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
                        <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Secure Zone</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Your document never leaves your device
                        </p>
                    </div>
                </div>

                {/* Content based on step */}
                <AnimatePresence mode="wait">
                    {step === "upload" && (
                        <motion.div
                            key="upload"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                        >
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={cn(
                                    "relative border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all",
                                    isDragging
                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                                        : "border-slate-300 dark:border-white/10 hover:border-blue-400 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5"
                                )}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="*/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                />
                                <Upload className="h-12 w-12 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
                                <p className="text-slate-900 dark:text-white font-medium mb-1">
                                    Drop your document here
                                </p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                    or click to browse
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === "category" && file && (
                        <motion.div
                            key="category"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="space-y-6 relative z-10"
                        >
                            {/* File preview */}
                            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-white/5">
                                <div className="p-3 rounded-xl bg-blue-500/20">
                                    <FileText className="h-6 w-6 text-blue-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-slate-400">
                                        {formatFileSize(file.size)} • {file.type || "Unknown type"}
                                    </p>
                                </div>
                                <button
                                    onClick={reset}
                                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Category selector */}
                            <DocumentCategorySelector
                                value={category}
                                onChange={setCategory}
                            />

                            {/* Error message */}
                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <p className="text-red-400 text-sm">{error}</p>
                                </div>
                            )}

                            {/* Sign button */}
                            <button
                                onClick={handleSign}
                                disabled={isRiskExcluded}
                                className={cn(
                                    "w-full py-4 px-6 font-semibold rounded-xl flex items-center justify-center gap-2 transition-all",
                                    isRiskExcluded
                                        ? "bg-slate-700/50 text-slate-500 cursor-not-allowed border border-white/5"
                                        : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                                )}
                            >
                                {isRiskExcluded ? (
                                    <>
                                        <Shield className="h-5 w-5" />
                                        Signature Blocked (Risk Level: Excluded)
                                    </>
                                ) : (
                                    <>
                                        <Zap className="h-5 w-5" />
                                        Sign & Anchor to Blockchain
                                    </>
                                )}
                            </button>
                        </motion.div>
                    )}

                    {step === "signing" && (
                        <motion.div
                            key="signing"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center py-12"
                        >
                            <Loader2 className="h-16 w-16 text-blue-400 animate-spin mx-auto mb-6" />
                            <p className="text-white font-medium mb-2">
                                Signing your document...
                            </p>
                            <p className="text-sm text-slate-400">
                                Generating cryptographic signature and anchoring to blockchain
                            </p>
                        </motion.div>
                    )}

                    {step === "complete" && result && (
                        <motion.div
                            key="complete"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-center py-8"
                        >
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 mb-6">
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Document Signed Successfully!
                            </h3>
                            <p className="text-slate-400 mb-6">
                                Your signature has been anchored to the blockchain
                            </p>

                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={() => setShowDetails(true)}
                                    className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={reset}
                                    className="px-4 py-2 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    Sign Another
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Transaction Details Modal */}
            {result && (
                <TransactionDetailsModal
                    isOpen={showDetails}
                    onClose={() => setShowDetails(false)}
                    anchorResult={result}
                    docHash={docHash}
                />
            )}
        </>
    );
}
