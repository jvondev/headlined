import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default function AppLayout({ children, modal }: { children: React.ReactNode, modal: React.ReactNode }) {
    return (
        <>
            <DashboardClient />
            <div className="hidden">{children}</div>
            {modal}
        </>
    );
}
