"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useParams, useSearchParams, usePathname } from 'next/navigation';
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
import { useRef } from 'react';

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
    const pathname = usePathname();

    const paramsView = params.view as string;

    // Persist the last valid dashboard view to prevent resetting when opening an article modal (intercepted route)
    // When the URL changes to /article/..., params.view becomes undefined.
    const lastViewRef = useRef(paramsView || 'today');

    // Update the ref only if we are still conceptually in the dashboard (not viewing an article)
    // We assume if pathname contains '/article/', we are in an intercepted state overlaid on the dashboard.
    if (!pathname?.includes('/article/')) {
        lastViewRef.current = paramsView || 'today';
    }

    const view = lastViewRef.current;

    const { hasSeenOnboarding, markOnboardingComplete } = useOnboardingStatus();
    const { loading: feedsLoading } = useSubscribedFeeds();

    const [availableTopics, setAvailableTopics] = useState<Topic[]>([]);
    const [availableInterests, setAvailableInterests] = useState<Interest[]>([]);
    const [loadingFeeds, setLoadingFeeds] = useState(true);

    // Initialize from cache on mount
    useEffect(() => {
        const cachedTopics = sessionStorage.getItem('dashboard_topics');
        const cachedInterests = sessionStorage.getItem('dashboard_interests');

        if (cachedTopics) setAvailableTopics(JSON.parse(cachedTopics));
        if (cachedInterests) setAvailableInterests(JSON.parse(cachedInterests));
        if (cachedTopics && cachedInterests) setLoadingFeeds(false);
    }, []);
    const [showOnboarding, setShowOnboarding] = useState(false);

    // Logic for 'today' view filtering
    useEffect(() => {
        if (view !== 'today') {
            setLoadingFeeds(false);
            return;
        }

        const filterFeeds = async () => {
            // Check cache again or force refresh if needed? 
            // Since we lazy loaded, we already have data if cached.
            // But we might want to refresh in background or if cache is empty.
            if (!loadingFeeds && availableTopics.length > 0) {
                // Already loaded from cache, maybe verify? 
                // For now, assume cache is good to avoid flicker.
            } else if (availableTopics.length === 0 && availableInterests.length === 0) {
                // No data, show skeleton (loadingFeeds is likely true already)
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

    // Logic for Onboarding
    useEffect(() => {
        if (view === 'today' && !loadingFeeds) {
            const subscribedTopics = getSubscribedTopics();
            const subscribedInterests = getSubscribedInterests();
            if (!hasSeenOnboarding || (subscribedTopics.length === 0 && subscribedInterests.length === 0)) {
                setShowOnboarding(true);
            }
        }
    }, [hasSeenOnboarding, loadingFeeds, view]);

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
        <main className="h-screen w-full bg-transparent" suppressHydrationWarning>
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
                            view={view}
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
