"use client";

import { SynchronizedCarousel } from "@/components/synchronized-carousel";
import { PremiumGuard } from "@/components/premium-guard";
import { OnboardingProvider } from "@/context/onboarding-provider";

export default function ThisMonthPage() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const startDate = firstDay.toISOString().split('T')[0];
    const endDate = today.toISOString().split('T')[0];

    return (
        <main className="h-screen w-full bg-background">
            <PremiumGuard>
                <OnboardingProvider>
                    <SynchronizedCarousel topics={[]} interests={[]} dateRange={{ start: startDate, end: endDate }} />
                </OnboardingProvider>
            </PremiumGuard>
        </main>
    );
}
