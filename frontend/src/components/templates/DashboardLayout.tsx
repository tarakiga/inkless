"use client";

import { ReactNode, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    LayoutDashboard,
    FileSignature,
    Settings,
    LogOut,
    Sparkles,
    User,
    Menu,
    X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
    children: ReactNode;
}

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/signatures", label: "Signatures", icon: FileSignature },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-8">
                <div className="p-2 rounded-xl bg-blue-500/20">
                    <Shield className="h-6 w-6 text-blue-400" />
                </div>
                <span className="text-xl font-bold text-white">Inkless</span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                                isActive
                                    ? "bg-blue-500/20 text-blue-400"
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </Link>
                    );
                })}

                {/* FAQ Button */}
                <Link
                    href="/faq"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-500/20 to-blue-500/20 text-purple-300 hover:from-purple-500/30 hover:to-blue-500/30 transition-all mt-4 border border-purple-500/20"
                >
                    <Sparkles className="h-5 w-5" />
                    How it Works
                </Link>
            </nav>

            {/* User Section */}
            <div className="border-t border-white/10 pt-4 mt-4">
                <div className="flex items-center gap-3 px-2 mb-3">
                    {session?.user?.image ? (
                        <img
                            src={session.user.image}
                            alt={session.user.name || "User"}
                            className="h-10 w-10 rounded-full border-2 border-white/10"
                        />
                    ) : (
                        <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                            <User className="h-5 w-5 text-slate-400" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                            {session?.user?.name || "Guest User"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                            {session?.user?.email || "Not signed in"}
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-blue-500/20">
                        <Shield className="h-5 w-5 text-blue-400" />
                    </div>
                    <span className="text-lg font-bold text-white">Inkless</span>
                </Link>
                <button
                    onClick={() => setIsMobileMenuOpen(true)}
                    className="p-2 rounded-lg hover:bg-white/10 text-white"
                >
                    <Menu className="h-6 w-6" />
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden md:flex fixed left-0 top-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-white/10 p-4 flex-col z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden"
                        />
                        <motion.aside
                            initial={{ x: "-100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 h-full w-[280px] bg-slate-900 border-r border-white/10 p-4 flex flex-col z-50 md:hidden shadow-2xl"
                        >
                            <div className="flex justify-end mb-2">
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 rounded-lg hover:bg-white/10 text-slate-400"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>
                            <SidebarContent />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="pt-16 md:pt-0 md:pl-64 transition-all">
                <div className="p-4 md:p-8">{children}</div>
            </main>
        </div>
    );
}
