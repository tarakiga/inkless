"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DashboardLayout from "@/components/templates/DashboardLayout";
import { SignatureCard } from "@/components/molecules/SignatureCard";
import { inklessAPI, RecentSignature } from "@/lib/api";
import { FileSignature, Search, Filter, Loader2, LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SignaturesPage() {
    const [signatures, setSignatures] = useState<RecentSignature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"list" | "grid">("list");

    useEffect(() => {
        async function fetchSignatures() {
            try {
                const data = await inklessAPI.getRecentSignatures();
                setSignatures(data);
            } catch (error) {
                console.error("Failed to fetch signatures:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchSignatures();
    }, []);

    const filteredSignatures = signatures.filter((sig) => {
        const matchesSearch = sig.fileName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || sig.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <div className="space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display tracking-tight text-white mb-2">Signatures</h1>
                        <p className="text-slate-400">
                            View and manage all your signed documents
                        </p>
                    </div>
                </div>

                {/* Filters & Controls */}
                <div className="flex flex-col md:flex-row gap-4 p-1 bg-slate-900/20 backdrop-blur-xl rounded-2xl border border-white/5">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search by filename..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-transparent border-none text-white placeholder:text-slate-500 focus:outline-none focus:ring-0"
                        />
                    </div>

                    <div className="h-px md:h-auto w-full md:w-px bg-white/10" />

                    <div className="flex items-center gap-4 px-2 pb-2 md:pb-0">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4 text-slate-500" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-transparent border-none text-sm text-slate-300 focus:outline-none focus:ring-0 cursor-pointer hover:text-white transition-colors py-2"
                            >
                                <option value="all" className="bg-slate-900">All Status</option>
                                <option value="anchored" className="bg-slate-900">Anchored</option>
                                <option value="pending" className="bg-slate-900">Pending</option>
                                <option value="failed" className="bg-slate-900">Failed</option>
                            </select>
                        </div>

                        <div className="h-8 w-px bg-white/10" />

                        {/* View Toggle */}
                        <div className="flex bg-slate-800/50 rounded-lg p-1 border border-white/5">
                            <button
                                onClick={() => setViewMode("list")}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === "list"
                                        ? "bg-blue-500/20 text-blue-400 shadow-sm"
                                        : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <List className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setViewMode("grid")}
                                className={cn(
                                    "p-1.5 rounded-md transition-all",
                                    viewMode === "grid"
                                        ? "bg-blue-500/20 text-blue-400 shadow-sm"
                                        : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                <LayoutGrid className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Signatures List */}
                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                        </div>
                    ) : filteredSignatures.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-white/10 rounded-2xl bg-white/5"
                        >
                            <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                <FileSignature className="h-8 w-8 text-slate-600" />
                            </div>
                            <h3 className="text-lg font-medium text-white mb-1">No signatures found</h3>
                            <p className="text-slate-400 max-w-sm">
                                {searchQuery || statusFilter !== "all"
                                    ? "Try adjusting your search or filters to find what you're looking for."
                                    : "Get started by signing your first document."}
                            </p>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={viewMode}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className={cn(
                                    viewMode === "grid"
                                        ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                                        : "space-y-3"
                                )}
                            >
                                {filteredSignatures.map((sig, index) => (
                                    <motion.div
                                        key={sig.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05, duration: 0.3 }}
                                    >
                                        <SignatureCard
                                            signature={sig}
                                            layout={viewMode}
                                        />
                                    </motion.div>
                                ))}
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
