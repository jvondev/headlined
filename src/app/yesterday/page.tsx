"use client";

import { SynchronizedCarousel } from "@/components/synchronized-carousel";
import { PremiumGuard } from "@/components/premium-guard";
import { OnboardingProvider } from "@/context/onboarding-provider";

export default function YesterdayPage() {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    return (
        <main className="h-screen w-full bg-background">
            <PremiumGuard>
                <OnboardingProvider>
                    <SynchronizedCarousel topics={[]} interests={[]} date={yesterday} initialViewState="dashboard" />
                </OnboardingProvider>
            </PremiumGuard>
        </main>
    );
}
