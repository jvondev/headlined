"use client";

import { useEffect, useState } from "react";
import { PremiumGuard } from "@/components/premium-guard";
import { SynchronizedCarousel } from "@/components/post-carousel";
import { fetchArchivePosts } from "@/lib/client-posts";
import { Post } from "@/types";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ArchiveDatePage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const params = useParams();
    const date = params.date as string;

    useEffect(() => {
        if (!date) return;
        const loadPosts = async () => {
            const data = await fetchArchivePosts(date);
            setPosts(data);
            setLoading(false);
        };
        loadPosts();
    }, [date]);

    return (
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
    );
}
