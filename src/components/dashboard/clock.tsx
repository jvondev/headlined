"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ClockProps {
    className?: string;
    variant?: "default" | "stacked";
}

export const Clock = ({ className, variant = "default" }: ClockProps) => {
    const [time, setTime] = useState<Date | null>(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    if (!time) return <div className={cn("animate-pulse bg-muted rounded", className)} />;

    const hours = time.getHours().toString().padStart(2, '0');
    const minutes = time.getMinutes().toString().padStart(2, '0');

    if (variant === "stacked") {
        return (
            <div className={cn("flex flex-col items-center justify-center leading-[0.75] font-bold tracking-tighter text-foreground select-none", className)}>
                <span className="-mb-16">{hours}</span>
                <span>{minutes}</span>
            </div>
        );
    }

    return (
        <div className={cn("font-medium text-foreground font-sans tabular-nums", className)}>
            {hours}:{minutes}
        </div>
    );
};
