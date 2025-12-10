import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Yesterday's News | Headlined",
    description: 'Your daily curated news feed. No noise, just the stories that matter.',
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: 'https://headlined.app/yesterday'
    }
};

export default function YesterdayPage() {
    return null;
}
