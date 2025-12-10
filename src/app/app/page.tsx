import { redirect } from 'next/navigation';

// /app route redirects to /app/today for the feed experience
export default function AppPage() {
    redirect('/app/today');
}
