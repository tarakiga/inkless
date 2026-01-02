"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/templates/DashboardLayout";
import { SecureZone } from "@/components/organisms/SecureZone";
import { SignatureCard } from "@/components/molecules/SignatureCard";
import { inklessAPI, RecentSignature } from "@/lib/api";
import {
    FileSignature,
    ArrowRight,
    Loader2,
    TrendingUp,
    ShieldCheck,
    Clock,
    Activity,
    Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

// Initial loading state for stats
const initialStats = [
    {
        label: "Signature Velocity",
        value: "...",
        change: "--%",
        trend: "neutral",
        icon: TrendingUp,
        description: "Signatures this month",
        color: "text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20"
    },
    {
        label: "Security Score",
        value: "...",
        change: "Calculating...",
        trend: "neutral",
        icon: ShieldCheck,
        description: "Identity protection",
        color: "text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20"
    },
    {
        label: "Network Status",
        value: "Polygon PoS",
        change: "Operational",
        trend: "up",
        icon: Zap,
        description: "Blockchain connectivity",
        color: "text-purple-400",
        bg: "bg-purple-500/10",
        border: "border-purple-500/20"
    }
];

export default function DashboardPage() {
    const [recentSignatures, setRecentSignatures] = useState<RecentSignature[]>([]);
    const [dashboardStats, setDashboardStats] = useState(initialStats);
    const [isLoading, setIsLoading] = useState(true);
    const [greeting, setGreeting] = useState("Welcome back");
    const [currentDate, setCurrentDate] = useState("");

    useEffect(() => {
        // Set Greeting based on time
        const hour = new Date().getHours();
        if (hour < 12) setGreeting("Good morning");
        else if (hour < 18) setGreeting("Good afternoon");
        else setGreeting("Good evening");

        // Set Date
        const dateOptions: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        setCurrentDate(new Date().toLocaleDateString('en-US', dateOptions));

        async function fetchData() {
            try {
                // Fetch signatures and stats in parallel
                const [signatures, statsData] = await Promise.all([
                    inklessAPI.getRecentSignatures(),
                    inklessAPI.getDashboardStats()
                ]);

                setRecentSignatures(signatures);

                // Update stats state with real data
                setDashboardStats([
                    {
                        ...initialStats[0],
                        value: statsData.velocity.value,
                        change: statsData.velocity.change,
                        trend: statsData.velocity.trend,
                    },
                    {
                        ...initialStats[1],
                        value: statsData.securityScore.value,
                        change: statsData.securityScore.change,
                        trend: statsData.securityScore.trend,
                    },
                    {
                        ...initialStats[2],
                        value: statsData.networkStatus.value,
                        change: statsData.networkStatus.change,
                        trend: statsData.networkStatus.trend,
                    }
                ]);

            } catch (error) {
                console.error("Failed to fetch dashboard data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleSignComplete = (result: any) => {
        // Refresh the signatures list
        inklessAPI.getRecentSignatures().then(setRecentSignatures);
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="text-slate-400 text-sm font-medium mb-1 flex items-center gap-2">
                            <Clock className="h-3 w-3" />
                            {currentDate}
                        </p>
                        <h1 className="text-4xl font-bold dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-white dark:to-slate-400 text-slate-900">
                            {greeting}, User
                        </h1>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="flex items-center gap-3"
                    >
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-medium text-slate-600 dark:text-white">System Status</span>
                            <span className="text-xs text-emerald-500 dark:text-emerald-400 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Operational
                            </span>
                        </div>
                    </motion.div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {dashboardStats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.1 * index }}
                            className={cn(
                                "relative group overflow-hidden rounded-2xl p-6 backdrop-blur-xl border transition-all duration-300",
                                "bg-white dark:bg-slate-900/40 border-slate-200 dark:border-white/5 hover:border-blue-400/30 dark:hover:border-white/20 hover:shadow-lg dark:hover:bg-slate-800/60",
                                stat.border
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="relative flex justify-between items-start mb-4">
                                <div className={cn("p-3 rounded-xl", stat.bg)}>
                                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                                </div>
                                <div className={cn("px-2 py-1 rounded-lg text-xs font-medium border bg-opacity-10",
                                    stat.trend === "up" ? "bg-emerald-500 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-slate-500 text-slate-600 dark:text-slate-400 border-slate-500/20"
                                )}>
                                    {stat.change}
                                </div>
                            </div>

                            <div className="relative">
                                <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400">{stat.label}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Action Area (Deployment Bay) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-900/50 backdrop-blur-xl shadow-2xl">
                            <div className="absolute inset-0 bg-grid-white/[0.02] [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                            <div className="absolute top-0 right-0 p-6 opacity-20">
                                <FileSignature className="w-32 h-32 text-blue-500 blur-3xl" />
                            </div>

                            <div className="relative p-6 border-b border-white/5 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-400" />
                                    Active Signing Surface
                                </h2>
                                <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium animate-pulse">
                                    Ready for Drop
                                </div>
                            </div>

                            <div className="relative p-6">
                                <SecureZone onSignComplete={handleSignComplete} />
                            </div>
                        </div>
                    </motion.div>

                    {/* Timeline Feed */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="bg-slate-800/30 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col h-full"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                            <Link
                                href="/dashboard/signatures"
                                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                            >
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                            </div>
                        ) : recentSignatures.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-4">
                                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                                    <FileSignature className="h-8 w-8 text-slate-600" />
                                </div>
                                <p className="text-slate-400">No activity yet</p>
                                <p className="text-sm text-slate-500 mt-1">
                                    Sign your first document to see it here
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4 overflow-y-auto max-h-[600px] pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                                {recentSignatures.slice(0, 5).map((sig, i) => (
                                    <motion.div
                                        key={sig.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 * i }}
                                    >
                                        <div className="group p-4 rounded-xl bg-slate-900/50 border border-white/5 hover:bg-slate-800/80 hover:border-blue-500/30 transition-all cursor-pointer">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:scale-110 transition-transform">
                                                        <FileSignature className="h-4 w-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-white truncate max-w-[150px]">
                                                            {sig.fileName}
                                                        </p>
                                                        <p className="text-xs text-slate-500">
                                                            {new Date(sig.signDate).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider",
                                                    sig.status === 'anchored' ? "bg-emerald-500/10 text-emerald-400" :
                                                        sig.status === 'pending' ? "bg-amber-500/10 text-amber-400" :
                                                            "bg-slate-700 text-slate-400"
                                                )}>
                                                    {sig.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between mt-3 pl-11">
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <FileSignature className="h-3 w-3" />
                                                    {sig.documentCategory ? sig.documentCategory.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) : 'General Document'}
                                                </p>
                                                <Link
                                                    href={`/dashboard/signatures?id=${sig.id}`}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-blue-400 hover:underline flex items-center gap-1"
                                                >
                                                    View Details
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
