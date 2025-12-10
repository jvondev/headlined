import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Today's Headlines | Headlined",
    description: 'Your daily curated news feed. No noise, just the stories that matter.',
    robots: {
        index: true,
        follow: true,
    },
    alternates: {
        canonical: 'https://headlined.app/today'
    }
};

export default function TodayPage() {
    return null;
}
