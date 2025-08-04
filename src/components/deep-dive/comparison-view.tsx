
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
    <Table>
      <TableHeader>
        <TableRow className="border-none">
          <TableHead className="w-1/3">Feature</TableHead>
          <TableHead className="text-center">{titleA}</TableHead>
          <TableHead className="text-center">{titleB}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">{item.feature}</TableCell>
            <TableCell className="text-center">{item.itemA}</TableCell>
            <TableCell className="text-center">{item.itemB}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
