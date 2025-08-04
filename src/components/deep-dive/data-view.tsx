
import type { DataPoint } from "@/types";
import type { FC } from "react";
import { cn } from "@/lib/utils";

interface DataViewProps {
  points: DataPoint[];
}

export const DataView: FC<DataViewProps> = ({ points }) => {
  const count = points.length;

  // Determine grid classes based on the number of points
  const gridClasses = cn("grid grid-cols-1 gap-6 text-center", {
    "md:grid-cols-1": count === 1,
    "md:grid-cols-2": count === 2 || count === 4,
    "md:grid-cols-2 lg:grid-cols-3": count > 4, // For many items, a denser grid
    // For 3 items, we don't set a specific column count on md,
    // so it defaults to grid-cols-1 and items will wrap naturally.
    // On larger screens, this could be adjusted if needed.
  });


  return (
    <div className={gridClasses}>
      {points.map((point, index) => (
        <div key={index} className="p-4 rounded-lg bg-secondary/50">
          <p className="text-5xl font-bold font-headline text-primary">{point.value}</p>
          <p className="mt-2 text-muted-foreground">{point.label}</p>
        </div>
      ))}
    </div>
  );
};
