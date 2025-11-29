export function generateStaticParams() {
    return [
        { view: 'today' },
        { view: 'yesterday' },
        { view: 'archive' },
        { view: 'this-week' },
        { view: 'this-month' },
    ];
}

export default function DashboardPage() {
    return null;
}
