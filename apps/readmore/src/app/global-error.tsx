'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center p-4">
                    <div className="text-center space-y-4">
                        <h2 className="text-2xl font-bold">Something went wrong!</h2>
                        <p className="text-muted-foreground">
                            A critical error occurred. Please try again.
                        </p>
                        <button
                            onClick={reset}
                            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
