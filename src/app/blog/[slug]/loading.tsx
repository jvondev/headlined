
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight, Home } from "lucide-react";

export default function BlogPostLoading() {
  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4">
            <div className="flex justify-between items-center h-16">
                <Button variant="ghost" size="icon" disabled>
                    <Home className="h-5 w-5" />
                </Button>
                <div className="flex-1 text-center px-4">
                     <Skeleton className="h-6 w-1/2 mx-auto hidden sm:block" />
                </div>
                 <div className="flex gap-2">
                    <Button variant="outline" size="icon" disabled>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" disabled>
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8 md:py-16">
        <article className="prose prose-lg dark:prose-invert mx-auto max-w-3xl">
          <Skeleton className="mb-12 w-full h-64 md:h-96 rounded-lg" />
          <div className="text-center mb-12 space-y-4">
            <Skeleton className="h-6 w-24 mx-auto" />
            <Skeleton className="h-12 w-3/4 mx-auto" />
            <Skeleton className="h-7 w-1/2 mx-auto" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[85%]" />
            <br />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-[90%]" />
          </div>
        </article>
      </main>
    </div>
  );
}
