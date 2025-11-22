"use client";

import { useCallback } from "react";
import { ArchivePageWrapper } from "@/components/archive-page-wrapper";
import { fetchArchivePosts } from "@/lib/client-posts";
import { useParams } from "next/navigation";

export default function ArchiveDatePage() {
    const params = useParams();
    const date = params.date as string;

    const fetchPosts = useCallback(async () => {
        if (!date) return [];
        return await fetchArchivePosts(date);
    }, [date]);

    return <ArchivePageWrapper fetchPosts={fetchPosts} />;
}
