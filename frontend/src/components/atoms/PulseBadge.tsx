"use client";

import { cn } from "@/lib/utils";

interface PulseBadgeProps {
    children: React.ReactNode;
    status?: "success" | "warning" | "error" | "info";
}

export function PulseBadge({ children, status = "success" }: PulseBadgeProps) {
    const statusColors = {
        success: {
            bg: "bg-emerald-500/20",
            dot: "bg-emerald-400",
            text: "text-emerald-400",
        },
        warning: {
            bg: "bg-yellow-500/20",
            dot: "bg-yellow-400",
            text: "text-yellow-400",
        },
        error: {
            bg: "bg-red-500/20",
            dot: "bg-red-400",
            text: "text-red-400",
        },
        info: {
            bg: "bg-blue-500/20",
            dot: "bg-blue-400",
            text: "text-blue-400",
        },
    };

    const colors = statusColors[status];

    return (
        <span
            className={cn(
                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium",
                colors.bg,
                colors.text
            )}
        >
            <span className={cn("relative flex h-2 w-2")}>
                <span
                    className={cn(
                        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
                        colors.dot
                    )}
                />
                <span
                    className={cn(
                        "relative inline-flex rounded-full h-2 w-2",
                        colors.dot
                    )}
                />
            </span>
            {children}
        </span>
    );
}
