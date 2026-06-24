import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Search News | Headlined',
    description: 'Search through curated news topics and articles on Headlined.',
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: 'https://headlined.app/search'
    }
};

export default function SearchPage() {
    return null;
}
