"use client";

import { Button } from "@/components/ui/button";
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
                "relative overflow-hidden group bg-black text-white rounded-full border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5",
                className
            )}
            {...props}
        >
            <span className="relative z-10 flex items-center gap-2 font-bold tracking-wide">
                <Heart className="w-4 h-4 fill-current" />
                Support ReadMore+
            </span>
        </Button>
    );
}
