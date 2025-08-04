
"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X, Smile } from "lucide-react";
import { Card } from "./ui/card";
import { cn } from "@/lib/utils";

export function BottomAdPlaceholder() {
  const [isVisible, setIsVisible] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[60] p-2",
        "data-[state=visible]:animate-in data-[state=hidden]:animate-out",
        "data-[state=visible]:slide-in-from-bottom-full data-[state=hidden]:slide-out-to-bottom-full"
      )}
      data-state={isVisible ? "visible" : "hidden"}
    >
      <Card className="container mx-auto max-w-4xl p-2 flex items-center justify-between gap-4 bg-background/80 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <Smile className="h-8 w-8 text-muted-foreground flex-shrink-0" />
          <div className="flex flex-col">
            <h4 className="font-semibold text-sm">Advertisement</h4>
            <p className="text-xs text-muted-foreground">
              Your ad content here.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close Ad</span>
        </Button>
      </Card>
    </div>
  );
}
