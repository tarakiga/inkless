"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Scale } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TermsContent, PrivacyContent } from "./LegalContent";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalBase = ({ isOpen, onClose, title, icon: Icon, children }: ModalProps & { title: string; icon: any; children: React.ReactNode }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-slate-950/60 backdrop-blur-sm"
                    />
                    <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl max-h-[85vh] flex flex-col pointer-events-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="flex-none p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
                                        <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6 text-slate-600 dark:text-slate-300">
                                {children}
                            </div>

                            {/* Footer */}
                            <div className="flex-none p-6 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>,
        document.body
    );
};

export const TermsModal = ({ isOpen, onClose }: ModalProps) => (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Terms of Service" icon={Scale}>
        <TermsContent />
    </ModalBase>
);

export const PrivacyModal = ({ isOpen, onClose }: ModalProps) => (
    <ModalBase isOpen={isOpen} onClose={onClose} title="Privacy Policy" icon={Shield}>
        <PrivacyContent />
    </ModalBase>
);
