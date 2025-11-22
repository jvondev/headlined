"use client";

import { useCallback } from "react";
import { ArchivePageWrapper } from "@/components/archive-page-wrapper";
import { fetchArchivePosts } from "@/lib/client-posts";

export default function YesterdayPage() {
    const fetchPosts = useCallback(async () => {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        return await fetchArchivePosts(yesterday);
    }, []);

    return <ArchivePageWrapper fetchPosts={fetchPosts} />;
}
