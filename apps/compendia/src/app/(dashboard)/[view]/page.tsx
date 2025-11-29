export function generateStaticParams() {
    return [
        { view: 'today' },
        { view: 'yesterday' },
        { view: 'archive' },
        { view: 'this-week' },
        { view: 'this-month' },
    ];
}

import { VerticalFeed } from "@/components/vertical-feed";

export default async function DashboardPage({ params }: { params: Promise<{ view: string }> }) {
    const { view } = await params;
    return (
        <div className="h-full w-full">
            <VerticalFeed key={view} view={view} />
        </div>
    );
}
