"use client";

import { useState, useEffect } from "react";
import DashboardLayout from "@/components/templates/DashboardLayout";
import { inklessAPI, TrustedDevice, UserProfile, UserPreferences, AccountStats } from "@/lib/api";
import {
    Smartphone,
    Monitor,
    Trash2,
    User,
    Shield,
    Loader2,
    AlertTriangle,
    X,
    Key,
    Bell,
    Moon,
    Laptop,
    LogOut,
    CheckCircle2,
    Fingerprint
} from "lucide-react";
import { PulseBadge } from "@/components/atoms/PulseBadge";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";

import { EditProfileModal } from "@/components/molecules/EditProfileModal";

import { useSession } from "next-auth/react";

export default function SettingsPage() {
    const { data: session } = useSession();
    const [devices, setDevices] = useState<TrustedDevice[]>([]);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [accountStats, setAccountStats] = useState<AccountStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState<TrustedDevice | null>(null);
    const [revokeAllModal, setRevokeAllModal] = useState(false);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRevoking, setIsRevoking] = useState(false);
    const [activeTab, setActiveTab] = useState<"account" | "security" | "preferences">("account");

    // Auto-sync profile from session
    useEffect(() => {
        if (session?.user && profile) {
            // If logged in via Google but backend has different email, sync it.
            // This handles the initial "Demo User" case and any subsequent drifts.
            if (session.user.email && profile.email !== session.user.email) {
                console.log("Syncing profile from session...");

                // Optimistic update for immediate UI feedback
                const newProfile = {
                    name: session.user.name || profile.name,
                    email: session.user.email
                };
                setProfile(prev => ({ ...prev!, ...newProfile }));

                // Persist to backend
                inklessAPI.updateProfile(newProfile)
                    .catch(err => console.error("Failed to persist profile sync:", err));
            }
        }
    }, [session, profile]);

    useEffect(() => {
        async function fetchData() {
            try {
                // Use Promise.allSettled to handle partial failures gracefully
                const results = await Promise.allSettled([
                    inklessAPI.getDevices(),
                    inklessAPI.getProfile(),
                    inklessAPI.getPreferences(),
                    inklessAPI.getAccountStats(),
                ]);

                // Extract results, using null/defaults for failed promises
                if (results[0].status === 'fulfilled') setDevices(results[0].value);
                if (results[1].status === 'fulfilled') setProfile(results[1].value);
                if (results[2].status === 'fulfilled') setPreferences(results[2].value);
                if (results[3].status === 'fulfilled') setAccountStats(results[3].value);

                // Log any errors for debugging
                results.forEach((result, index) => {
                    if (result.status === 'rejected') {
                        const endpoints = ['devices', 'profile', 'preferences', 'accountStats'];
                        console.warn(`Failed to fetch ${endpoints[index]}:`, result.reason);
                    }
                });
            } catch (error) {
                console.error("Failed to fetch settings data:", error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchData();
    }, []);

    const handleRevokeAllDevices = async () => {
        setIsRevoking(true);
        try {
            await inklessAPI.revokeAllDevices();
            // Refresh devices list
            const devicesData = await inklessAPI.getDevices();
            setDevices(devicesData);
            setRevokeAllModal(false);
        } catch (error) {
            console.error("Failed to revoke devices:", error);
        } finally {
            setIsRevoking(false);
        }
    };

    const { theme: currentTheme, setTheme } = useTheme();

    const handleThemeChange = (theme: string) => {
        setTheme(theme as "dark" | "light" | "system");
    };

    const handleNotificationToggle = async (key: 'notifyOnSign' | 'notifyOnNewDevice' | 'notifyWeeklyReport') => {
        if (!preferences) return;
        try {
            const updated = await inklessAPI.updatePreferences({ [key]: !preferences[key] });
            setPreferences(updated);
        } catch (error) {
            console.error("Failed to update notification setting:", error);
        }
    };

    const formatStorageSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleDeleteDevice = async () => {
        if (!deleteModal) return;
        setIsDeleting(true);
        try {
            await inklessAPI.removeDevice(deleteModal.id);
            setDevices((prev) => prev.filter((d) => d.id !== deleteModal.id));
            setDeleteModal(null);
        } catch (error) {
            console.error("Failed to delete device:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const getDeviceIcon = (type: string) => {
        if (type.toLowerCase().includes("mobile")) {
            return <Smartphone className="h-5 w-5" />;
        }
        return <Monitor className="h-5 w-5" />;
    };

    const tabs = [
        { id: "account", label: "Account", icon: User },
        { id: "security", label: "Security", icon: Shield },
        { id: "preferences", label: "Preferences", icon: SettingsIcon },
    ];

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold font-display tracking-tight text-white mb-2">Settings</h1>
                        <p className="text-slate-400">
                            Manage your identity, security, and preferences
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1 bg-slate-900/20 backdrop-blur-xl rounded-xl border border-white/5 w-full md:w-fit">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={cn(
                                    "relative flex items-center gap-2 px-3 py-2 md:px-6 md:py-2.5 rounded-lg text-xs md:text-sm font-medium transition-all flex-1 md:flex-none justify-center whitespace-nowrap",
                                    isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-blue-500/10 border border-blue-500/20 rounded-lg"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Icon className={cn("h-4 w-4 relative z-10", isActive ? "text-blue-400" : "")} />
                                <span className="relative z-10">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                    </div>
                ) : (
                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {activeTab === "account" && (
                                <motion.div
                                    key="account"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {/* Identity Card */}
                                    <div className="relative overflow-hidden bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-3xl border border-white/10 p-8 shadow-2xl">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />

                                        <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 p-[2px]">
                                                <div className="h-full w-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                                                    {profile?.name ? (
                                                        <span className="text-3xl font-bold text-white">
                                                            {profile.name.charAt(0)}
                                                        </span>
                                                    ) : (
                                                        <User className="h-10 w-10 text-slate-400" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h2 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                                        {profile?.name || "Anonymous User"}
                                                    </h2>
                                                    {profile?.isVerified && (
                                                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-1">
                                                            <CheckCircle2 className="h-3 w-3" />
                                                            Verified Identity
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-slate-400">{profile?.email}</p>
                                                <div className="flex items-center gap-2 pt-2">
                                                    <div className="px-3 py-1.5 rounded-lg bg-slate-950/50 border border-white/5 font-mono text-xs text-slate-500 flex items-center gap-2">
                                                        <Fingerprint className="h-3 w-3" />
                                                        {profile?.did || "did:inkless:placeholder"}
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => setIsEditProfileOpen(true)}
                                                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors"
                                            >
                                                Edit Profile
                                            </button>
                                        </div>
                                    </div>

                                    {/* Stats / Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="p-6 rounded-2xl bg-slate-800/20 border border-white/5">
                                            <p className="text-sm text-slate-500 font-medium">Documents Signed</p>
                                            <p className="text-2xl font-semibold text-white mt-1">{accountStats?.documentsCount || 0}</p>
                                        </div>
                                        <div className="p-6 rounded-2xl bg-slate-800/20 border border-white/5">
                                            <p className="text-sm text-slate-500 font-medium">Plan</p>
                                            <p className="text-2xl font-semibold text-white mt-1">{accountStats?.plan || "Free"}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "security" && (
                                <motion.div
                                    key="security"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    {/* Passkeys Section - Coming Soon */}
                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative">
                                        <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                                            Coming Soon
                                        </div>
                                        <div className="p-6 border-b border-white/5">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <Key className="h-5 w-5 text-blue-400" />
                                                Passkeys & Authentication
                                            </h3>
                                            <p className="text-slate-400 text-sm mt-1">Manage your hardware keys and biometric authentication methods.</p>
                                        </div>
                                        <div className="p-6 bg-slate-900/20 opacity-50 pointer-events-none">
                                            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-800/20 md:flex-row flex-col gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <Fingerprint className="h-5 w-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">Windows Hello / TouchID</p>
                                                        <p className="text-xs text-slate-500">Not configured</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">Setup</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* NIMC Identity Verification - Coming Soon */}
                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden relative">
                                        <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                                            Coming Soon
                                        </div>
                                        <div className="p-6 border-b border-white/5">
                                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                <Shield className="h-5 w-5 text-blue-400" />
                                                NIMC Identity Verification
                                            </h3>
                                            <p className="text-slate-400 text-sm mt-1">Verify your legal identity using your National Identification Number (NIN).</p>
                                        </div>
                                        <div className="p-6 bg-slate-900/20 opacity-50 pointer-events-none">
                                            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-slate-800/20 md:flex-row flex-col gap-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                                        <User className="h-5 w-5 text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">vNIN Verification</p>
                                                        <p className="text-xs text-slate-500">Not verified</p>
                                                    </div>
                                                </div>
                                                <button className="text-sm text-blue-400 hover:text-blue-300 font-medium">Verify Now</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Trusted Devices Section */}
                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden">
                                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                    <Shield className="h-5 w-5 text-emerald-400" />
                                                    Trusted Devices
                                                </h3>
                                                <p className="text-slate-400 text-sm mt-1">Devices authorized to access your account.</p>
                                            </div>
                                            <button
                                                onClick={() => setRevokeAllModal(true)}
                                                className="hidden md:block text-sm text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                Revoke All
                                            </button>
                                        </div>
                                        <div className="p-6 grid gap-4 grid-cols-1 md:grid-cols-2">
                                            {devices.map((device) => (
                                                <div
                                                    key={device.id}
                                                    className="group relative flex items-start gap-4 p-5 bg-slate-800/30 rounded-2xl border border-white/5 hover:border-white/10 transition-all hover:bg-slate-800/50"
                                                >
                                                    <div className="p-3 rounded-xl bg-slate-700/30 text-slate-300 group-hover:scale-110 transition-transform">
                                                        {getDeviceIcon(device.deviceType)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between mb-1">
                                                            <p className="text-white font-medium truncate pr-2">
                                                                {device.deviceName}
                                                            </p>
                                                            {device.isActive ? (
                                                                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                                            ) : (
                                                                <button
                                                                    onClick={() => setDeleteModal(device)}
                                                                    className="text-slate-500 hover:text-red-400 transition-colors"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400 flex items-center gap-1.5">
                                                            {device.location}
                                                            <span className="w-1 h-1 rounded-full bg-slate-700" />
                                                            {new Date(device.lastSeenAt).toLocaleDateString()}
                                                        </p>
                                                        {device.isActive && <p className="text-xs text-emerald-400/80 mt-2 font-medium">Currently Active</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "preferences" && (
                                <motion.div
                                    key="preferences"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6">
                                        <h3 className="text-lg font-semibold text-white mb-6">Appearance</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {['system', 'dark', 'light'].map((theme) => (
                                                <button
                                                    key={theme}
                                                    onClick={() => handleThemeChange(theme)}
                                                    className={cn(
                                                        "p-4 rounded-xl border flex flex-col items-center gap-3 transition-all",
                                                        currentTheme === theme
                                                            ? "bg-blue-500/10 border-blue-500/50 text-white"
                                                            : "bg-slate-800/30 border-white/5 text-slate-400 hover:bg-slate-800/50"
                                                    )}
                                                >
                                                    {theme === 'dark' ? <Moon className="h-6 w-6" /> : theme === 'light' ? <Laptop className="h-6 w-6" /> : <Monitor className="h-6 w-6" />}
                                                    <span className="text-sm font-medium capitalize">{theme}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative">
                                        <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-medium">
                                            Coming Soon
                                        </div>
                                        <h3 className="text-lg font-semibold text-white mb-4">Notifications</h3>
                                        <div className="space-y-4 opacity-50 pointer-events-none">
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-slate-300">Email me when a document is signed</span>
                                                <div className="w-11 h-6 rounded-full relative transition-colors cursor-pointer bg-slate-700">
                                                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm left-1" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-slate-300">Alert for new device logins</span>
                                                <div className="w-11 h-6 rounded-full relative transition-colors cursor-pointer bg-slate-700">
                                                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm left-1" />
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between py-2">
                                                <span className="text-slate-300">Weekly activity report</span>
                                                <div className="w-11 h-6 rounded-full relative transition-colors cursor-pointer bg-slate-700">
                                                    <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm left-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
                                        <h3 className="text-lg font-semibold text-red-400 mb-2">Danger Zone</h3>
                                        <p className="text-slate-400 text-sm mb-4">Irreversible actions for your account.</p>
                                        <button
                                            onClick={() => setRevokeAllModal(true)}
                                            className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-colors flex items-center gap-2"
                                        >
                                            <LogOut className="h-4 w-4" />
                                            Sign out of all devices
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {deleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setDeleteModal(null)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setDeleteModal(null)}
                                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/20">
                                    <Trash2 className="h-6 w-6 text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    Remove Device?
                                </h3>
                            </div>

                            <p className="text-slate-400 mb-6 leading-relaxed">
                                Are you sure you want to remove <span className="text-white font-medium">{deleteModal.deviceName}</span>?
                                This will sign it out instantly.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteModal(null)}
                                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteDevice}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/20"
                                >
                                    {isDeleting ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Delete Device"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Revoke All Devices Confirmation Modal */}
            <AnimatePresence>
                {revokeAllModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setRevokeAllModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-2xl p-6 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setRevokeAllModal(false)}
                                className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/20">
                                    <LogOut className="h-6 w-6 text-red-500" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    Sign Out All Devices?
                                </h3>
                            </div>

                            <p className="text-slate-400 mb-2 leading-relaxed">
                                Are you sure you want to sign out of all other devices?
                            </p>
                            <p className="text-red-400/80 text-sm mb-6">
                                This action is irreversible and cannot be undone.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setRevokeAllModal(false)}
                                    className="flex-1 px-4 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors font-medium border border-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleRevokeAllDevices}
                                    disabled={isRevoking}
                                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 font-medium shadow-lg shadow-red-500/20"
                                >
                                    {isRevoking ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Sign Out All"
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Edit Profile Modal */}
            {profile && (
                <EditProfileModal
                    isOpen={isEditProfileOpen}
                    onClose={() => setIsEditProfileOpen(false)}
                    currentProfile={profile}
                    onUpdate={(newProfile) => setProfile((prev) => ({ ...prev!, ...newProfile }))}
                />
            )}
        </DashboardLayout>
    );
}

function SettingsIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.39a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    )
}
