"use client";

import { SynchronizedCarousel } from "@/components/synchronized-carousel";
import { PremiumGuard } from "@/components/premium-guard";
import { OnboardingProvider } from "@/context/onboarding-provider";
import { useSearchParams } from "next/navigation";

export default function ArchivePage() {
    const searchParams = useSearchParams();
    const date = searchParams.get("date") || undefined;

    return (
        <main className="h-screen w-full bg-background">
            <PremiumGuard>
                <OnboardingProvider>
                    <SynchronizedCarousel topics={[]} interests={[]} date={date} initialViewState="dashboard" />
                </OnboardingProvider>
            </PremiumGuard>
        </main>
    );
}
