import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
            <div className="text-center space-y-4">
                <h2 className="text-2xl font-bold">404 - Page Not Found</h2>
                <p className="text-muted-foreground">
                    The page you're looking for doesn't exist.
                </p>
                <Link
                    href="/"
                    className="inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                >
                    Go back home
                </Link>
            </div>
        </div>
    );
}
