import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <DashboardClient />
            <div className="hidden">{children}</div>
        </>
    );
}
