"use client";

import { useEffect, useState } from "react";
import { PremiumGuard } from "@/components/premium-guard";
import { SynchronizedCarousel } from "@/components/post-carousel";
import { OnboardingProvider } from "@/context/onboarding-provider";
import { fetchArchivePosts } from "@/lib/client-posts";
import { Post } from "@/types";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function YesterdayPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const loadPosts = async () => {
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
            const data = await fetchArchivePosts(yesterday);
            setPosts(data);
            setLoading(false);
        };
        loadPosts();
    }, []);

    return (
        <OnboardingProvider>
            <PremiumGuard>
                <div className="fixed top-4 left-4 z-50">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/today")}>
                        <ArrowLeft className="w-6 h-6" />
                    </Button>
                </div>
                {loading ? (
                    <div className="flex items-center justify-center min-h-screen">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                ) : (
                    <SynchronizedCarousel posts={posts} />
                )}
            </PremiumGuard>
        </OnboardingProvider>
    );
}
