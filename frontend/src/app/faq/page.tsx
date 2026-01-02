"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Shield,
    Search,
    ChevronDown,
    FileSignature,
    Database,
    Lock,
    Zap,
    Scale,
    Cpu,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type FAQCategory = "All" | "Security" | "Legal" | "Technology" | "Usage";

interface FAQItem {
    question: string;
    answer: string;
    category: FAQCategory;
    icon: any;
}

const faqs: FAQItem[] = [
    // Security
    {
        category: "Security",
        icon: Shield,
        question: "Is my document uploaded to a server?",
        answer: "No. Inkless follows a strict Privacy-by-Design architecture. Your documents are hashed locally on your device using SHA-3. Only the cryptographic fingerprint (hash) leaves your device; the file itself never touches our servers."
    },
    {
        category: "Security",
        icon: Cpu,
        question: "What is Post-Quantum Cryptography (PQC)?",
        answer: "PQC refers to cryptographic algorithms (like Dilithium and Kyber) that are secure against attacks from both classical and future quantum computers. Inkless uses these advanced standards (NIST-approved) to future-proof your signatures for decades."
    },
    {
        category: "Security",
        icon: Lock,
        question: "How are my keys managed?",
        answer: "Your signing keys are generated locally in your browser's secure memory or hardware enclave (WebAuthn). The private key never leaves your device and is never stored on our servers."
    },
    // Legal
    {
        category: "Legal",
        icon: Scale,
        question: "Are these signatures legally binding?",
        answer: "Yes. Inkless signatures comply with major e-signature regulations (like ESIGN Act, eIDAS) by ensuring: (1) Signer intent, (2) Attribution (via DID), and (3) Integrity (via Blockchain Anchoring). However, for specific use cases (like wills or real estate), local laws may vary."
    },
    {
        category: "Legal",
        icon: FileSignature,
        question: "What is 'Non-Repudiation'?",
        answer: "Non-repudiation means a signer cannot deny having signed a document. By anchoring the signature hash to a public blockchain, we create an immutable timestamped proof that serves as objective evidence in a court of law."
    },
    // Technology
    {
        category: "Technology",
        icon: Database,
        question: "Why use Blockchain Anchoring?",
        answer: "Blockchain acts as a decentralized 'Digital Notary'. By recording the document hash on a public ledger (Polygon), we provide mathematical proof that the document existed in a specific state at a specific time, without needing to trust a central authority."
    },
    {
        category: "Technology",
        icon: Zap,
        question: "What happens if Inkless shuts down?",
        answer: "Your signatures remain valid. Since the proofs are on a public blockchain and the verification logic is open-source (client-side), you can verify any Inkless-signed document independently without relying on our active servers."
    },
    // Usage
    {
        category: "Usage",
        icon: FileSignature,
        question: "Can I sign on my mobile phone?",
        answer: "Absolutely. Inkless is fully responsive and works efficiently on mobile browsers. You can use your phone's biometrics (FaceID/TouchID) to authorize signatures if your device supports WebAuthn."
    }
];

const glossaryTerms = [
    {
        term: "SHA-3 Hash",
        definition: "A cryptographic fingerprint of your document. Any change to the document creates a completely different hash. This ensures we can verify integrity without seeing the file content."
    },
    {
        term: "Post-Quantum Cryptography (PQC)",
        definition: "Next-generation encryption algorithms (NIST-approved) designed to withstand attacks from future quantum computers, ensuring long-term security."
    },
    {
        term: "DID (Decentralized Identifier)",
        definition: "A unique digital identity that you control completely. Unlike usernames owned by Google or Facebook, a DID is yours forever and isn't tied to any central server."
    },
    {
        term: "Blockchain Anchoring",
        definition: "The process of recording a timestamped proof (hash) on a public ledger (Polygon). This creates an immutable record that the document existed at a specific time."
    },
    {
        term: "Zero-Knowledge Proof",
        definition: "A method of proving you know something (like a password or key) without revealing the information itself. Inkless uses this to verify identity without storing your biometric data."
    },
    {
        term: "Non-Repudiation",
        definition: "A legal concept ensuring a signer cannot deny the authenticity of their signature. Our blockchain proofs provide technical non-repudiation."
    }
];

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
    const { data: session } = useSession();

    const backLink = session ? "/dashboard" : "/";
    const backLabel = session ? "Back to Dashboard" : "Back to Home";

    const categories = ["All", "Security", "Legal", "Technology", "Usage", "Glossary"];

    const filteredFaqs = faqs.filter(faq => {
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "All" || faq.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const filteredGlossary = glossaryTerms.filter(item =>
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[128px]" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[128px]" />
            </div>

            {/* Navigation */}
            <nav className="absolute top-0 left-0 w-full p-6 z-50 flex items-center justify-between">
                <Link
                    href={backLink}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/50 backdrop-blur-md border border-white/5 hover:bg-white/5 transition-all group"
                >
                    <div className="p-1.5 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                        <ArrowRight className="h-4 w-4 text-blue-400 rotate-180" />
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{backLabel}</span>
                </Link>
            </nav>

            <main className="relative z-10 max-w-4xl mx-auto px-6 py-20 md:py-32">

                {/* Hero Section */}
                <div className="text-center mb-16 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-4"
                    >
                        <Shield className="h-4 w-4" />
                        <span>Knowledge Base & Support</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold font-display tracking-tight dark:bg-clip-text dark:text-transparent dark:bg-gradient-to-r dark:from-white dark:via-white dark:to-slate-400 text-slate-900"
                    >
                        How can we help you?
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Explore the technology, security, and legal framework behind Inkless.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="relative max-w-xl mx-auto mt-8 group"
                    >
                        <div className="absolute inset-0 bg-blue-500/20 blur-xl group-hover:bg-blue-500/30 transition-all rounded-full opacity-0 group-hover:opacity-100" />
                        <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-2xl ring-1 ring-white/5 focus-within:ring-blue-500/50 transition-all">
                            <Search className="h-5 w-5 text-slate-400 ml-2" />
                            <input
                                type="text"
                                placeholder={activeCategory === 'Glossary' ? "Search terms..." : "Search questions..."}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-white placeholder:text-slate-500 px-4 py-1 text-lg"
                            />
                        </div>
                    </motion.div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap justify-center gap-2 mb-12">
                    {categories.map((category, index) => (
                        <motion.button
                            key={category}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            onClick={() => setActiveCategory(category)}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 border",
                                activeCategory === category
                                    ? "bg-white text-slate-900 border-white shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    : "bg-slate-800/30 text-slate-400 border-white/5 hover:border-white/20 hover:text-white hover:bg-slate-800/50"
                            )}
                        >
                            {category === "Glossary" && <Database className="h-3 w-3 mr-2 inline-block" />}
                            {category}
                        </motion.button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    <AnimatePresence mode="wait">
                        {activeCategory === "Glossary" ? (
                            <motion.div
                                key="glossary"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-4"
                            >
                                {filteredGlossary.length > 0 ? (
                                    filteredGlossary.map((item, index) => (
                                        <motion.div
                                            key={item.term}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="p-6 rounded-2xl bg-slate-800/20 border border-white/5 hover:bg-slate-800/40 hover:border-white/10 transition-all group"
                                        >
                                            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                                                {item.term}
                                            </h3>
                                            <p className="text-slate-400 text-sm leading-relaxed">
                                                {item.definition}
                                            </p>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="col-span-full text-center py-20">
                                        <p className="text-slate-500">No definitions found.</p>
                                    </div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="faq-list"
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="space-y-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredFaqs.length > 0 ? (
                                        filteredFaqs.map((faq, index) => (
                                            <motion.div
                                                key={faq.question}
                                                layout
                                                initial={{ opacity: 0, scale: 0.98 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0, scale: 0.98 }}
                                                transition={{ duration: 0.2 }}
                                                className="group"
                                            >
                                                <button
                                                    onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                                                    className={cn(
                                                        "w-full text-left p-6 rounded-2xl border transition-all duration-300",
                                                        expandedIndex === index
                                                            ? "bg-slate-800/50 border-blue-500/30 shadow-[0_0_30px_rgba(59,130,246,0.1)]"
                                                            : "bg-white dark:bg-slate-900/30 border-slate-200 dark:border-white/5 hover:border-blue-400/20 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-slate-800/30"
                                                    )}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        <div className={cn(
                                                            "mt-1 p-2 rounded-lg transition-colors",
                                                            expandedIndex === index ? "bg-blue-500/20 text-blue-400" : "bg-slate-800 text-slate-500"
                                                        )}>
                                                            <faq.icon className="h-5 w-5" />
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="flex items-center justify-between gap-4">
                                                                <h3 className={cn(
                                                                    "text-lg font-semibold transition-colors pr-8",
                                                                    expandedIndex === index ? "text-white" : "text-slate-700 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-white"
                                                                )}>
                                                                    {faq.question}
                                                                </h3>
                                                                <ChevronDown className={cn(
                                                                    "h-5 w-5 text-slate-500 transition-transform duration-300 shrink-0",
                                                                    expandedIndex === index ? "rotate-180 text-blue-400" : ""
                                                                )} />
                                                            </div>
                                                            <AnimatePresence>
                                                                {expandedIndex === index && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: "auto", opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <p className="pt-4 text-slate-400 leading-relaxed border-t border-white/5 mt-4">
                                                                            {faq.answer}
                                                                        </p>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </div>
                                                    </div>
                                                </button>
                                            </motion.div>
                                        ))
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-20 border border-dashed border-white/10 rounded-2xl"
                                        >
                                            <p className="text-slate-500">No answers found for "{searchQuery}"</p>
                                            <button
                                                onClick={() => setSearchQuery("")}
                                                className="mt-2 text-blue-400 hover:underline"
                                            >
                                                Clear search
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer CTA */}
                <div className="mt-20 text-center">
                    <p className="text-slate-500 mb-6">Still have questions?</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href={backLink} className="w-full sm:w-auto px-8 py-3 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                            {session ? "Go to Dashboard" : "Go to Home"}
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                        <a href="mailto:support@inkless.io" className="w-full sm:w-auto px-8 py-3 bg-slate-800 text-white font-medium rounded-xl hover:bg-slate-700 transition-colors border border-white/5">
                            Contact Support
                        </a>
                    </div>
                </div>

            </main>
        </div>
    );
}
