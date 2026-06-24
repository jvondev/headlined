import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "This Week's Top Stories | Headlined",
    description: 'Your daily curated news feed. No noise, just the stories that matter.',
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: 'https://headlined.app/this-week'
    }
};

export default function ThisWeekPage() {
    return null;
}
