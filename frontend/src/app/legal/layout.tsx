import Link from "next/link";
import { Shield } from "lucide-react";

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10">
                <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 dark:bg-blue-500/20">
                            <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">Inkless</span>
                    </Link>
                </div>
            </header>

            <main className="py-12 px-4">
                <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-white/10 p-6 md:p-10">
                    {children}
                </div>
            </main>

            <footer className="border-t border-slate-200 dark:border-white/10 py-8 px-4 text-center text-sm text-slate-500 dark:text-slate-400">
                <p>&copy; {new Date().getFullYear()} Inkless. All rights reserved.</p>
            </footer>
        </div>
    );
}
