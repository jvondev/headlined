"use client";

import { useState, useEffect } from "react";

interface AppUsage {
    daysUsed: number;
    consecutiveDays: number;
    lastLaunchDate: string | null;
    firstLaunchDate: string | null;
}

export function useAppUsage() {
    const [usage, setUsage] = useState<AppUsage>({
        daysUsed: 0,
        consecutiveDays: 0,
        lastLaunchDate: null,
        firstLaunchDate: null,
    });

    useEffect(() => {
        const storedUsage = localStorage.getItem("app-usage");
        const today = new Date().toISOString().split("T")[0];

        let currentUsage: AppUsage;

        if (storedUsage) {
            currentUsage = JSON.parse(storedUsage);
        } else {
            currentUsage = {
                daysUsed: 0,
                consecutiveDays: 0,
                lastLaunchDate: null,
                firstLaunchDate: today, // First launch ever
            };
        }

        // If first launch date is missing (legacy users), set it to today
        if (!currentUsage.firstLaunchDate) {
            currentUsage.firstLaunchDate = today;
        }

        if (currentUsage.lastLaunchDate !== today) {
            // New day launch
            const lastDate = currentUsage.lastLaunchDate ? new Date(currentUsage.lastLaunchDate) : null;
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayString = yesterday.toISOString().split("T")[0];

            if (lastDate && currentUsage.lastLaunchDate === yesterdayString) {
                // Consecutive day
                currentUsage.consecutiveDays += 1;
            } else {
                // Streak broken or first day
                currentUsage.consecutiveDays = 1;
            }

            currentUsage.daysUsed += 1;
            currentUsage.lastLaunchDate = today;

            localStorage.setItem("app-usage", JSON.stringify(currentUsage));
        }

        // Calculate total days since first launch (more robust than daysUsed for "age" of user)
        const firstDate = new Date(currentUsage.firstLaunchDate);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - firstDate.getTime());
        const daysSinceFirstLaunch = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        setUsage({
            ...currentUsage,
            daysUsed: daysSinceFirstLaunch, // Override daysUsed with actual calendar days since start
        });

    }, []);

    return usage;
}
