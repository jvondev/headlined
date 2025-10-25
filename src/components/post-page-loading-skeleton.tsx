import { Skeleton } from "@/components/ui/skeleton";

export function PostPageLoadingSkeleton() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-8">
        <div className="w-full h-full max-w-3xl flex flex-col items-center justify-center gap-4 text-center">
            <div className="flex justify-center gap-2 mb-2 w-full">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
            </div>
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-7 w-full max-w-xl" />
        </div>
    </main>
  );
}