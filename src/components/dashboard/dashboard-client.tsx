"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
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

function DashboardContent() {
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
            // Try to load from session storage first to avoid skeleton
            const cachedTopics = sessionStorage.getItem('dashboard_topics');
            const cachedInterests = sessionStorage.getItem('dashboard_interests');

            if (cachedTopics && cachedInterests) {
                setAvailableTopics(JSON.parse(cachedTopics));
                setAvailableInterests(JSON.parse(cachedInterests));
                setLoadingFeeds(false);
            } else if (availableTopics.length === 0 && availableInterests.length === 0) {
                // Only show full page skeleton if we have NO data at all and no cache
                setLoadingFeeds(true);
            }

            const filteredTopics: Topic[] = [];
            for (const topic of topicsData) {
                const hasPosts = await checkIfFeedHasPosts("topic", topic.name);
                if (hasPosts) {
                    filteredTopics.push(topic as Topic);
                }
            }

            const filteredInterests: Interest[] = [];
            for (const interest of interestsData) {
                const hasPosts = await checkIfFeedHasPosts("interest", interest.name);
                if (hasPosts) {
                    filteredInterests.push(interest as Interest);
                }
            }

            // Update state and cache
            setAvailableTopics(filteredTopics);
            setAvailableInterests(filteredInterests);
            sessionStorage.setItem('dashboard_topics', JSON.stringify(filteredTopics));
            sessionStorage.setItem('dashboard_interests', JSON.stringify(filteredInterests));

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
        let periodLabel: string | undefined = undefined;

        switch (view) {
            case 'today':
                topics = availableTopics;
                interests = availableInterests;
                // Keep initialViewState undefined to let SynchronizedCarousel/DashboardContent handle intro logic
                break;
            case 'yesterday':
                date = new Date(Date.now() - 86400000).toISOString().split('T')[0];
                usePremiumGuard = false;
                break;
            case 'archive':
                date = searchParams.get("date") || undefined;
                usePremiumGuard = false;
                break;
            case 'this-week':
                const today = new Date();
                const last7DaysStart = new Date(today);
                last7DaysStart.setDate(today.getDate() - 6);

                // Use local date strings to avoid UTC shifts excluding today's content
                const toLocalYMD = (d: Date) => {
                    const offset = d.getTimezoneOffset() * 60000;
                    return new Date(d.getTime() - offset).toISOString().split('T')[0];
                };

                dateRange = {
                    start: toLocalYMD(last7DaysStart),
                    end: toLocalYMD(today)
                };
                usePremiumGuard = false;
                periodLabel = "in the last 7 days";
                break;
            case 'this-month':
                const t = new Date();
                const last30DaysStart = new Date(t);
                last30DaysStart.setDate(t.getDate() - 29);

                const toLocalYMD2 = (d: Date) => {
                    const offset = d.getTimezoneOffset() * 60000;
                    return new Date(d.getTime() - offset).toISOString().split('T')[0];
                };

                dateRange = {
                    start: toLocalYMD2(last30DaysStart),
                    end: toLocalYMD2(t)
                };
                usePremiumGuard = false;
                periodLabel = "in the last 30 days";
                break;
        }

        return { date, dateRange, initialViewState, topics, interests, usePremiumGuard, periodLabel };
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
                            isIntroPaused={showOnboarding}
                            periodLabel={carouselProps.periodLabel}
                        />
                    )}
                </PremiumGuard>
            </OnboardingProvider>
        </main>
    );
}

export function DashboardClient() {
    return (
        <Suspense fallback={<PostPageLoadingSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}
