
"use client"

import { ThumbsDown, ThumbsUp } from "lucide-react";
import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface MythViewProps {
  myth: string;
  fact: string;
}

export const MythView: FC<MythViewProps> = ({ myth, fact }) => {
  const sections = [
    { 
      value: "item-1",
      title: "Myth",
      content: myth,
      icon: ThumbsDown,
      className: "text-destructive"
    },
    { 
      value: "item-2",
      title: "Fact", 
      content: fact, 
      icon: ThumbsUp,
      className: "text-primary"
    },
  ];

  return (
    <Accordion type="single" collapsible defaultValue="item-1" className="w-full pr-4 space-y-4">
      {sections.map((section) => {
        const Icon = section.icon;
        return (
          <AccordionItem key={section.value} value={section.value} className={cn("border-none rounded-lg p-4", section.className === "text-destructive" ? "bg-destructive/5" : "bg-primary/5")}>
              <AccordionTrigger className="p-0 hover:no-underline">
                <div className="flex items-center gap-4">
                    <Icon className={cn("size-8 flex-shrink-0", section.className)} />
                    <h3 className={cn("font-headline text-xl font-semibold", section.className)}>{section.title}</h3>
                </div>
              </AccordionTrigger>
            <AccordionContent className="pt-4 text-base">
              <p className="text-lg leading-relaxed text-card-foreground/80">{section.content}</p>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
};
