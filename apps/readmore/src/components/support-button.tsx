"use client";

import { Button } from "@repo/ui/components/ui/button";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface SupportButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    className?: string;
}

export function SupportButton({ className, ...props }: SupportButtonProps) {
    return (
        <Button
            variant="default"
            className={cn(
                "relative overflow-hidden group bg-black dark:bg-white text-white dark:text-black rounded-full border-none shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-105",
                className
            )}
            {...props}
        >
            {/* Animated Overlay - Subtle Gray */}
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 dark:from-zinc-200 dark:via-zinc-100 dark:to-zinc-200 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Shimmer Effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/30 dark:via-black/30 to-transparent" />

            {/* Subtle Pulse Ring */}
            <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-20 animate-ping bg-white dark:bg-black" />

            <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
                <Heart className="w-4 h-4 fill-current group-hover:scale-110 transition-transform duration-300" />
                Support ReadMore+
            </span>
        </Button>
    );
}
