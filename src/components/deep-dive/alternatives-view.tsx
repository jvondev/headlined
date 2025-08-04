
"use client";

import type { AlternativeItem } from "@/types";
import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface AlternativesViewProps {
  points: AlternativeItem[];
}

export const AlternativesView: FC<AlternativesViewProps> = ({ points }) => {
  return (
    <Accordion type="single" collapsible className="w-full pr-4 space-y-4">
      {points.map((alt, index) => (
        <AccordionItem 
          key={index} 
          value={`item-${index}`}
          className="border-none rounded-lg p-4 bg-secondary/30"
        >
          <AccordionTrigger className="text-left font-semibold text-base py-0 hover:no-underline">
            {alt.name}
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-0 text-sm text-muted-foreground">
             <p className="whitespace-pre-wrap">{alt.description}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
