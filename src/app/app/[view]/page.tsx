import { Metadata } from 'next';

type Props = {
    params: Promise<{ view: string }>
};

export function generateStaticParams() {
    return [
        { view: 'today' },
        { view: 'yesterday' },
        { view: 'archive' },
        { view: 'this-week' },
        { view: 'this-month' },
        { view: 'saved' },
        { view: 'search' },
    ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { view } = await params;

    const titles: Record<string, string> = {
        'today': 'Today\'s Headlines | Headlined',
        'yesterday': 'Yesterday\'s News | Headlined',
        'this-week': 'This Week\'s Top Stories | Headlined',
        'this-month': 'This Month\'s Top Stories | Headlined',
        'archive': 'News Archive | Headlined',
        'saved': 'Your Saved Articles | Headlined',
        'search': 'Search News | Headlined',
    };

    const title = titles[view] || 'Headlined App';
    const description = view === 'saved'
        ? 'Access your saved articles and bookmarks on Headlined.'
        : view === 'search'
            ? 'Search through curated news topics and articles on Headlined.'
            : 'Your daily curated news feed. No noise, just the stories that matter.';

    return {
        title,
        description,
        robots: {
            index: view === 'today', // Only index the main today view
            follow: true,
        },
        alternates: {
            canonical: `https://headlined.app/app/${view}`
        }
    };
}

export default function AppViewPage() {
    return null;
}
