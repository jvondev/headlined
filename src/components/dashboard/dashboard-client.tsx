"use client";

import { useEffect, useState, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { PostPageLoadingSkeleton } from "@/components/post-page-loading-skeleton";
import { topicsData } from "@/data/topics-data";
import { interestsData } from "@/data/interests-data";
import { OnboardingProvider } from "@/context/onboarding-provider";
import { useOnboardingStatus } from '@/hooks/use-onboarding-status';
import { OnboardingFlow } from '@/components/onboarding/onboarding-flow';
import { useSubscribedFeeds } from '@/hooks/use-subscribed-feeds';
import { checkIfFeedHasPosts } from '@/lib/client-posts';
import { Topic, Interest } from '@/types';
import { getSubscribedTopics, getSubscribedInterests } from '@/lib/local-storage';
import { PremiumGuard } from "@/components/premium-guard";

const SynchronizedCarousel = dynamic(
    () => import('@/components/synchronized-carousel').then(mod => mod.SynchronizedCarousel),
    {
        loading: () => <PostPageLoadingSkeleton />,
        ssr: false,
    }
);

export function DashboardClient() {
    const params = useParams();
    const searchParams = useSearchParams();
    const view = params.view as string; // 'today', 'yesterday', 'archive', 'this-week', 'this-month'

    const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();
    const { loading: feedsLoading } = useSubscribedFeeds();
    const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
    const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
    const [loadingFeeds, setLoadingFeeds] = useState(true);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Logic for 'today' view filtering
    useEffect(() => {
        if (view !== 'today') {
            setLoadingFeeds(false);
            return;
        }

        const filterFeeds = async () => {
            // Only show full page skeleton if we have NO data at all
            if (availableTopics.length === 0 && availableInterests.length === 0) {
                setLoadingFeeds(true);
            }

            const filteredTopics: Topic[] = [];
            for (const topic of topicsData) {
                const hasPosts = await checkIfFeedHasPosts("topic", topic.name);
                if (hasPosts) {
                    filteredTopics.push(topic as Topic);
                }
            }
            setAvailableTopics(filteredTopics);

            const filteredInterests: Interest[] = [];
            for (const interest of interestsData) {
                const hasPosts = await checkIfFeedHasPosts("interest", interest.name);
                if (hasPosts) {
                    filteredInterests.push(interest as Interest);
                }
            }
            setAvailableInterests(filteredInterests);
            setLoadingFeeds(false);
        };

        filterFeeds();
    }, [view]);

    // Logic for Onboarding (only relevant for 'today' usually, but code had it)
    useEffect(() => {
        if (view === 'today' && !feedsLoading) {
            const subscribedTopics = getSubscribedTopics();
            const subscribedInterests = getSubscribedInterests();
            if (!hasSeenOnboarding || (subscribedTopics.length === 0 && subscribedInterests.length === 0)) {
                setShowOnboarding(true);
            }
        }
    }, [hasSeenOnboarding, feedsLoading, view]);

    // Determine props based on view
    const carouselProps = useMemo(() => {
        let date: string | undefined = undefined;
        let dateRange: { start: string; end: string } | undefined = undefined;
        let initialViewState: "intro" | "dashboard" | undefined = undefined;
        let topics: Topic[] = [];
        let interests: Interest[] = [];
        let usePremiumGuard = false;

        switch (view) {
            case 'today':
                topics = availableTopics;
                interests = availableInterests;
                // Keep initialViewState undefined to let SynchronizedCarousel/DashboardContent handle intro logic
                break;
            case 'yesterday':
                date = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                initialViewState = "dashboard";
                usePremiumGuard = true;
                break;
            case 'archive':
                date = searchParams.get("date") || undefined;
                initialViewState = "dashboard";
                usePremiumGuard = true;
                break;
            case 'this-week':
                const today = new Date();
                const day = today.getDay(); // 0 is Sunday
                const diff = today.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
                const monday = new Date(today.setDate(diff));
                dateRange = {
                    start: monday.toISOString().split('T')[0],
                    end: new Date().toISOString().split('T')[0]
                };
                initialViewState = "dashboard";
                usePremiumGuard = true;
                break;
            case 'this-month':
                const t = new Date();
                const firstDay = new Date(t.getFullYear(), t.getMonth(), 1);
                dateRange = {
                    start: firstDay.toISOString().split('T')[0],
                    end: t.toISOString().split('T')[0]
                };
                initialViewState = "dashboard";
                usePremiumGuard = true;
                break;
        }

        return { date, dateRange, initialViewState, topics, interests, usePremiumGuard };
    }, [view, searchParams, availableTopics, availableInterests]);

    return (
        <main className="h-screen w-full bg-background">
            <OnboardingProvider>
                <OnboardingFlow
                    isOpen={showOnboarding}
                    onClose={() => {
                        markOnboardingComplete();
                        setShowOnboarding(false);
                    }}
                    availableTopics={availableTopics}
                    availableInterests={availableInterests}
                />
                <PremiumGuard disabled={!carouselProps.usePremiumGuard}>
                    {loadingFeeds && view === 'today' ? (
                        <PostPageLoadingSkeleton />
                    ) : (
                        <SynchronizedCarousel
                            topics={carouselProps.topics}
                            interests={carouselProps.interests}
                            date={carouselProps.date}
                            dateRange={carouselProps.dateRange}
                            initialViewState={carouselProps.initialViewState}
                        />
                    )}
                </PremiumGuard>
            </OnboardingProvider>
        </main>
    );
}
