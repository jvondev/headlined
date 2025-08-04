"use client"

import type { HowToStep } from "@/types";
import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface HowToViewProps {
  steps: HowToStep[];
}

export const HowToView: FC<HowToViewProps> = ({ steps }) => {
  return (
    <Accordion type="single" collapsible className="w-full pr-4">
      {steps.map((step, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-b-0">
          <div className="flex gap-4 items-center py-4">
            <div className="flex items-center">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold flex-shrink-0">
                {index + 1}
              </div>
            </div>
            <div className="flex-1">
              <AccordionTrigger className="text-left font-semibold text-base p-0 hover:no-underline">
                {step.title}
              </AccordionTrigger>
              <AccordionContent className="pt-2 pb-0 text-sm text-muted-foreground">
                <p className="whitespace-pre-wrap">{step.description}</p>
              </AccordionContent>
            </div>
          </div>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
