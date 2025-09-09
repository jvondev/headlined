"use client"

import type { QnaItem } from "@/types";
import type { FC } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface QnaViewProps {
  questions: QnaItem[];
}

export const QnaView: FC<QnaViewProps> = ({ questions }) => {
  return (
    <Accordion type="single" collapsible className="w-full p-6">
      {questions.map((qna, index) => (
        <AccordionItem key={index} value={`item-${index}`}>
          <AccordionTrigger className="text-left font-semibold">
            {qna.q}
          </AccordionTrigger>
          <AccordionContent className="text-base text-muted-foreground">
            {/* Using a simple p tag instead of MarkdownRenderer to avoid extra formatting */}
            <p className="whitespace-pre-wrap">{qna.a}</p>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};
