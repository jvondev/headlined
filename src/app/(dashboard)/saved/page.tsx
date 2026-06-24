import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Your Saved Articles | Headlined',
    description: 'Access your saved articles and bookmarks on Headlined.',
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: 'https://headlined.saved'
    }
};

export default function SavedPage() {
    return null;
}
