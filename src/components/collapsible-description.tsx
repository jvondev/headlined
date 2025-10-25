"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface CollapsibleDescriptionProps {
  description: string;
  className?: string;
}

export const CollapsibleDescription: React.FC<CollapsibleDescriptionProps> = ({ description, className }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const truncatedText = description.split(" ").slice(0, 12).join(" ");
  const isTruncated = description.split(" ").length > 12;

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded} className={cn("w-full", className)}>
      <CollapsibleContent>
        <div>
          {description}
        </div>
      </CollapsibleContent>
      <CollapsibleTrigger asChild>
        <div className={cn(
          "mt-4 text-lg md:text-xl max-w-xl",
          "text-muted-foreground"
      )}>
          {isExpanded ? "" : truncatedText}
          {isTruncated && !isExpanded && (
            <>
              <span>... </span>
              <Badge variant="secondary" className="cursor-pointer">more</Badge>
            </>
          )}
        </div>
      </CollapsibleTrigger>
    </Collapsible>
  );
};