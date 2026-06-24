import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'News Archive | Headlined',
    description: 'Your daily curated news feed. No noise, just the stories that matter.',
    robots: {
        index: false,
        follow: true,
    },
    alternates: {
        canonical: 'https://headlined.app/archive'
    }
};

export default function ArchivePage() {
    return null;
}
