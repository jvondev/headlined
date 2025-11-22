"use client";

import { SynchronizedCarousel } from "@/components/synchronized-carousel";
import { PremiumGuard } from "@/components/premium-guard";
import { OnboardingProvider } from "@/context/onboarding-provider";

export default function ArchivePage() {
    return (
        <PremiumGuard>
            <OnboardingProvider>
                <SynchronizedCarousel topics={[]} interests={[]} />
            </OnboardingProvider>
        </PremiumGuard>
    );
}
