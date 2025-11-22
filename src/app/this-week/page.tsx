"use client";

import { SynchronizedCarousel } from "@/components/synchronized-carousel";
import { PremiumGuard } from "@/components/premium-guard";
import { OnboardingProvider } from "@/context/onboarding-provider";

export default function ThisWeekPage() {
    const today = new Date();
    const day = today.getDay(); // 0 is Sunday
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
    const monday = new Date(today.setDate(diff));

    const startDate = monday.toISOString().split('T')[0];
    const endDate = new Date().toISOString().split('T')[0];

    return (
        <PremiumGuard>
            <OnboardingProvider>
                <SynchronizedCarousel topics={[]} interests={[]} dateRange={{ start: startDate, end: endDate }} />
            </OnboardingProvider>
        </PremiumGuard>
    );
}
