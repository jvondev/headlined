import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <DashboardClient />
            <div className="hidden">{children}</div>
        </>
    );
}
