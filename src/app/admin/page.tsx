import { notFound } from 'next/navigation';
import AdminDashboard from '@/components/admin/admin-dashboard';

export const dynamic = 'force-static';

export default function AdminPage() {
    // Only accessible in development
    if (process.env.NODE_ENV !== 'development') {
        notFound();
    }

    return <AdminDashboard />;
}
