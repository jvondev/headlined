
import type { ComparisonItem } from "@/types";
import type { FC } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";

interface ComparisonViewProps {
  titleA: string;
  titleB: string;
  items: ComparisonItem[];
}

export const ComparisonView: FC<ComparisonViewProps> = ({ titleA, titleB, items }) => {
  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <Table>
      <TableHeader className="bg-muted">
        <TableRow>
          <TableHead className="w-1/3 p-3">Feature</TableHead>
          <TableHead className="text-left p-3">{titleA}</TableHead>
          <TableHead className="text-left p-3">{titleB}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index} className="border-b">
            <TableCell className="font-medium p-3 text-left text-sm md:text-base">{item.feature}</TableCell>
            <TableCell className="p-3 text-left text-sm md:text-base">{item.itemA}</TableCell>
            <TableCell className="p-3 text-left text-sm md:text-base">{item.itemB}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    </div>
    </div>
  );
};
