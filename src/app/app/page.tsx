import { redirect } from 'next/navigation';

// /app route redirects to /today for the feed experience
export default function AppPage() {
    redirect('/today');
}
