
import type { MetadataItem } from "@/types";
import type { FC } from "react";
import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface MetadataViewProps {
  items: MetadataItem[];
}

export const MetadataView: FC<MetadataViewProps> = ({ items }) => {
  return (
    <Card className="bg-secondary/30">
        <CardContent className="p-6">
            <ul className="space-y-4">
            {items.map((item, index) => (
                <li key={index} className="flex flex-col">
                    <span className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">{item.label}</span>
                    {item.label.toLowerCase().includes('link') ? (
                        <Link href={item.value} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-primary hover:underline truncate">
                            <span className="truncate">{item.value}</span>
                            <ExternalLink className="size-4 flex-shrink-0" />
                        </Link>
                    ) : (
                        <span className="text-base">{item.value}</span>
                    )}
                </li>
            ))}
            </ul>
        </CardContent>
    </Card>
  );
};
