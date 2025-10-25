import { FC } from "react";
import type { Summary } from "@/types";
import { Card } from "@/components/ui/card";
import { DynamicIcon } from "@/components/dynamic-icon";

interface SummaryViewProps {
  summary: Summary;
}

export const SummaryView: FC<SummaryViewProps> = ({ summary }) => {
  return (
    <Card className="h-full w-full flex flex-col p-4">
      <div className="border-b pb-4 text-center">
        <div className="flex justify-center items-center gap-3">
          {summary.icon && <DynamicIcon name={summary.icon} className="size-7 text-primary/70" />}
          <h2 className="font-headline text-2xl">{summary.title}</h2>
        </div>
      </div>
      <div className="flex-1 mt-4 md:px-8 overflow-y-auto">
        <div className="w-full max-w-4xl h-full mx-auto">
          <p>{summary.content.snippet}</p>
        </div>
      </div>
    </Card>
  );
};
