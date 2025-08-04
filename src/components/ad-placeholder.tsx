
"use client";

import { Card } from "./ui/card";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdPlaceholderProps {
  className?: string;
  isCompact?: boolean;
}

export function AdPlaceholder({ className, isCompact = false }: AdPlaceholderProps) {
  return (
    <div className={cn("w-full flex items-center justify-center bg-background p-4", className)}>
      <Card className={cn("w-full h-full max-w-4xl flex flex-col items-center justify-center border-dashed border-2", isCompact ? "min-h-[100px] p-4" : "max-h-[80vh] h-screen p-4")}>
        <div className="text-center text-muted-foreground">
          <DollarSign className="size-16 mx-auto mb-4" />
          <h2 className="text-2xl font-headline font-semibold">Advertisement</h2>
          <p className="mt-2 text-sm">This space is reserved for an ad.</p>
        </div>
      </Card>
    </div>
  );
}
