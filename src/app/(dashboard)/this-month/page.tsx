import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "This Month's Top Stories | Headlined",
    description: 'Your daily curated news feed. No noise, just the stories that matter.',
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: 'https://headlined.app/this-month'
    }
};

export default function ThisMonthPage() {
    return null;
}
