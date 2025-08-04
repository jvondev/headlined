
"use client";

import type { ChecklistItem } from "@/types";
import { useState, type FC } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ChecklistViewProps {
  items: ChecklistItem[];
}

export const ChecklistView: FC<ChecklistViewProps> = ({ items: initialItems }) => {
  const [items, setItems] = useState(initialItems);

  const handleCheckedChange = (index: number, checked: boolean) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], isDone: checked };
    setItems(newItems);
  };

  return (
    <div className="space-y-4 pr-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-3">
          <Checkbox
            id={`item-${index}`}
            checked={item.isDone}
            onCheckedChange={(checked) => handleCheckedChange(index, !!checked)}
            className="size-5 rounded-full"
          />
          <Label
            htmlFor={`item-${index}`}
            className={`flex-1 text-base ${
              item.isDone ? "text-muted-foreground line-through" : ""
            }`}
          >
            {item.text}
          </Label>
        </div>
      ))}
    </div>
  );
};
