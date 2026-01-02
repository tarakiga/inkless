"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Shield, Lock, Zap, CheckCircle2, ArrowRight, Globe } from "lucide-react";

export default function Home() {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/50 border-b border-slate-200 dark:border-white/10">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/20">
                            <Shield className="h-5 w-5 text-blue-400" />
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">Inkless</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            href="/verify"
                            className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                        >
                            Verify Document
                        </Link>
                        <Link
                            href="/auth/login"
                            className="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-32 pb-20 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <Globe className="h-4 w-4 text-emerald-400" />
                            <span className="text-sm text-emerald-400">Made for Nigeria</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                            Zero-Upload{" "}
                            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Digital Signatures
                            </span>
                        </h1>

                        <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-2xl mx-auto">
                            Sign documents securely without uploading them. Your files never leave
                            your device. Powered by post-quantum cryptography and blockchain.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/auth/login"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all"
                            >
                                Start Signing
                                <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/faq"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-white/10 dark:text-white dark:border-transparent dark:hover:bg-white/20 font-semibold rounded-xl transition-all"
                            >
                                How It Works
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: Lock,
                                title: "Zero-Upload Privacy",
                                description:
                                    "Documents are hashed and signed locally. Only cryptographic proofs leave your device.",
                                color: "text-emerald-400",
                                bg: "bg-emerald-500/20",
                            },
                            {
                                icon: Zap,
                                title: "Quantum-Resistant",
                                description:
                                    "Built with Dilithium post-quantum signatures to remain secure against future threats.",
                                color: "text-purple-400",
                                bg: "bg-purple-500/20",
                            },
                            {
                                icon: CheckCircle2,
                                title: "Blockchain Verified",
                                description:
                                    "Every signature is anchored on Polygon blockchain for permanent, tamper-proof records.",
                                color: "text-blue-400",
                                bg: "bg-blue-500/20",
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.1 }}
                                className="bg-white dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-6"
                            >
                                <div className={`p-3 rounded-xl ${feature.bg} w-fit mb-4`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-slate-600 dark:text-slate-400">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-slate-200 dark:border-white/10">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-blue-400" />
                        <span className="text-slate-500 dark:text-slate-400">
                            © 2025 Inkless. Built for Nigeria.
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                        <Link href="/faq" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            FAQ
                        </Link>
                        <Link href="/verify" className="hover:text-slate-900 dark:hover:text-white transition-colors">
                            Verify
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
