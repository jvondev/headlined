
"use client";

import { Button } from "@/components/ui/button";

type FilterType = "all" | "saved" | "note";

interface SavedItemsFilterProps {
  currentFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

export function SavedItemsFilter({ currentFilter, onFilterChange }: SavedItemsFilterProps) {
  const filters: { label: string; value: FilterType }[] = [
    { label: "All", value: "all" },
    { label: "Saved", value: "saved" },
    { label: "With Notes", value: "note" },
  ];

  return (
    <div className="flex items-center gap-2 rounded-full border bg-secondary/50 p-1">
      {filters.map(({ label, value }) => (
        <Button
          key={value}
          variant={currentFilter === value ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onFilterChange(value)}
          className="rounded-full px-4"
        >
          {label}
        </Button>
      ))}
    </div>
  );
}
