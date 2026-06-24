import { Suspense } from 'react';
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Suspense fallback={<div className="h-screen w-full bg-background" />}>
                <DashboardClient />
            </Suspense>
            <div className="hidden">{children}</div>
        </>
    );
}
