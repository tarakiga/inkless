"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertTriangle, Info, AlertCircle, Search, X } from "lucide-react";
import { documentCategories, DocumentCategory } from "@/lib/documentCategories";
import { cn } from "@/lib/utils";

interface DocumentCategorySelectorProps {
    value: string;
    onChange: (value: string) => void;
}

export function DocumentCategorySelector({
    value,
    onChange,
}: DocumentCategorySelectorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const selected = documentCategories.find((c) => c.id === value);

    const filteredCategories = documentCategories.filter(c =>
        c.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getWarningIcon = (level?: string) => {
        switch (level) {
            case "danger":
                return <AlertCircle className="h-4 w-4 text-red-400" />;
            case "warning":
                return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
            case "info":
                return <Info className="h-4 w-4 text-blue-400" />;
            default:
                return null;
        }
    };

    const getWarningStyles = (level?: string) => {
        switch (level) {
            case "danger":
                return "bg-red-500/10 border-red-500/20 text-red-400";
            case "warning":
                return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
            case "info":
                return "bg-blue-500/10 border-blue-500/20 text-blue-400";
            default:
                return "";
        }
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">
                Document Category
            </label>

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full flex items-center justify-between px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-left hover:border-white/20 transition-colors group"
            >
                <div>
                    <span className="text-white font-medium group-hover:text-blue-400 transition-colors">{selected?.label || "Select Category"}</span>
                    <p className="text-sm text-slate-400">{selected?.description || "Choose the type of document you are signing"}</p>
                </div>
                <div className="p-2 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                    <ChevronDown className="h-5 w-5 text-slate-400" />
                </div>
            </button>

            {/* Modal Overlay via Portal */}
            {mounted && createPortal(
                <AnimatePresence>
                    {isOpen && (
                        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                            {/* Backdrop */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setIsOpen(false)}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            />

                            {/* Modal Content */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                            >
                                {/* Modal Header */}
                                <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Search categories..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="w-full bg-slate-800/50 border border-white/5 rounded-lg pl-9 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                            autoFocus
                                        />
                                    </div>
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                    >
                                        <X className="h-5 w-5 text-slate-400" />
                                    </button>
                                </div>

                                {/* List */}
                                <div className="overflow-y-auto p-2 space-y-1">
                                    {filteredCategories.length > 0 ? (
                                        filteredCategories.map((category) => (
                                            <button
                                                key={category.id}
                                                onClick={() => {
                                                    onChange(category.id);
                                                    setIsOpen(false);
                                                    setSearchQuery("");
                                                }}
                                                className={cn(
                                                    "w-full px-4 py-3 text-left rounded-xl hover:bg-white/5 transition-all border border-transparent",
                                                    value === category.id ? "bg-blue-500/10 border-blue-500/20" : ""
                                                )}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={cn(
                                                        "font-medium",
                                                        value === category.id ? "text-blue-400" : "text-white"
                                                    )}>
                                                        {category.label}
                                                    </span>
                                                    {category.warning && getWarningIcon(category.warningLevel)}
                                                </div>
                                                <p className="text-sm text-slate-400">
                                                    {category.description}
                                                </p>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-8">
                                            <p className="text-slate-500">No categories found</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Warning message (Displayed outside modal for chosen item) */}
            <AnimatePresence>
                {selected?.warning && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className={cn(
                            "p-4 rounded-xl border",
                            getWarningStyles(selected.warningLevel)
                        )}
                    >
                        <div className="flex items-start gap-3">
                            {getWarningIcon(selected.warningLevel)}
                            <p className="text-sm">{selected.warning}</p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
