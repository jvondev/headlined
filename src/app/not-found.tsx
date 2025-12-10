'use client';

import Link from 'next/link';
import { Home } from 'lucide-react';

/**
 * Standard 404 Not Found Page
 */
export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
            <div className="text-center space-y-6 max-w-md">
                <div className="text-8xl font-bold text-muted-foreground/20">404</div>
                <h1 className="text-2xl font-bold">Page Not Found</h1>
                <p className="text-muted-foreground">The page you're looking for doesn't exist.</p>
                <Link href="/app/today" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90">
                    <Home className="w-4 h-4" /> Go to Headlines
                </Link>
            </div>
        </div>
    );
}
