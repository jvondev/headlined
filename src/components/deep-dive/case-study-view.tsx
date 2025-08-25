
"use client"

import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface CaseStudyViewProps {
  problem: string;
  solution: string;
  result: string;
}

export const CaseStudyView: FC<CaseStudyViewProps> = ({ problem, solution, result }) => {
  const sections = [
    { title: "Problem", content: problem },
    { title: "Solution", content: solution },
    { title: "Result", content: result },
  ];

  return (
    <Accordion type="single" collapsible defaultValue="item-0" className="w-full pr-4">
      {sections.map((section, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left font-semibold text-lg hover:no-underline">
            {section.title}
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground">
            <p className="whitespace-pre-wrap">{section.content}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
