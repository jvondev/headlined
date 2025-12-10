import { Suspense } from 'react';
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { ArticleModalProvider } from "@/context/article-modal-context";
import { ArticleModal } from "@/components/article-modal";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <ArticleModalProvider>
            <Suspense fallback={<div className="h-screen w-full bg-background" />}>
                <DashboardClient />
            </Suspense>
            <div className="hidden">{children}</div>
            <ArticleModal />
        </ArticleModalProvider>
    );
}
