"use client";

import { SynchronizedCarousel } from "@/components/synchronized-carousel";
import { PremiumGuard } from "@/components/premium-guard";
import { OnboardingProvider } from "@/context/onboarding-provider";
import { useSearchParams } from "next/navigation";

export default function ArchivePage() {
    const searchParams = useSearchParams();
    const date = searchParams.get("date") || undefined;

    return (
        <PremiumGuard>
            <OnboardingProvider>
                <SynchronizedCarousel topics={[]} interests={[]} date={date} />
            </OnboardingProvider>
        </PremiumGuard>
    );
}
