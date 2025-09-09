
import type { DataPoint } from "@/types";
import type { FC } from "react";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "@/components/dynamic-icon";

interface DataViewProps {
  points: DataPoint[];
}

export const DataView: FC<DataViewProps> = ({ points }) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {points.map((point, index) => (
        <div key={index} className="flex flex-col items-center justify-center p-4 rounded-lg bg-secondary/50 text-center h-full">
          {point.icon && <DynamicIcon name={point.icon} className="size-8 text-primary mb-2" />}
          <p className="text-lg font-semibold leading-tight">{point.value}</p>
          <p className="text-sm text-muted-foreground mt-1">{point.label}</p>
        </div>
      ))}
    </div>
  );
};
