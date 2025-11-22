"use client";

import { useCallback } from "react";
import { ArchivePageWrapper } from "@/components/archive-page-wrapper";
import { fetchDateRangePosts } from "@/lib/client-posts";

export default function ThisWeekPage() {
    const fetchPosts = useCallback(async () => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 7);

        const endDateStr = end.toISOString().split('T')[0];
        const startDateStr = start.toISOString().split('T')[0];

        const data = await fetchDateRangePosts(startDateStr, endDateStr);
        // Sort by date descending
        data.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
        return data;
    }, []);

    return <ArchivePageWrapper fetchPosts={fetchPosts} />;
}
