"use client";

import { useEffect, useState } from "react";
import { CompendiaPost } from "@/types";
import { fetchRecentWorks } from "@repo/lib/utils/openalex";
import { PostCard } from "./post-card";
import { Loader2 } from "lucide-react";

export function VerticalFeed() {
    const [posts, setPosts] = useState<CompendiaPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);

    useEffect(() => {
        async function loadPosts() {
            setLoading(true);
            const newPosts = await fetchRecentWorks(page);
            setPosts((prev) => [...prev, ...newPosts]);
            setLoading(false);
        }
        loadPosts();
    }, [page]);

    // Simple infinite scroll handler (can be improved with IntersectionObserver)
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 1.5 && !loading) {
            setPage((prev) => prev + 1);
        }
    };

    if (loading && posts.length === 0) {
        return (
            <div className="h-screen w-full flex items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div
            className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth no-scrollbar"
            onScroll={handleScroll}
        >
            {posts.map((post) => (
                <PostCard key={post.id} post={post} />
            ))}
            {loading && (
                <div className="h-20 flex items-center justify-center snap-end">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
            )}
        </div>
    );
}
