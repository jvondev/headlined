
import type { Insight, SavedItem } from "@/types";
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { DynamicIcon } from "./dynamic-icon";
import { DeepDivePreview } from "./deep-dive/deep-dive-preview";
import { BookText } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";


interface SavedItemPreviewCardProps {
    item: SavedItem;
    insight: Insight | null;
}

const InsightPreview: FC<{ insight: Insight }> = ({ insight }) => {
    return (
        <div className="relative w-full h-full text-foreground flex flex-col justify-center items-center text-center p-4">
            {insight.thumbnailUrl && (
                <>
                    <Image
                        src={insight.thumbnailUrl}
                        alt={insight.headline}
                        fill
                        className="object-cover"
                        sizes="33vw"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </>
            )}
            <div className={cn("relative", insight.thumbnailUrl && "text-white")}>
                <h2 className="font-headline text-lg font-bold leading-tight">{insight.headline}</h2>
            </div>
        </div>
    )
}

const BlogPreview: FC<{ item: SavedItem, insight: Insight }> = ({ item, insight }) => {
    return (
        <div className="w-full h-full flex flex-col justify-center items-center text-center p-4">
             <BookText className="size-8 text-muted-foreground/50" />
             <h2 className="font-headline text-lg font-bold leading-tight mt-4">{insight.title}</h2>
             <p className="mt-1 text-sm text-muted-foreground">Full Story</p>
        </div>
    )
}

const DeepDiveCardPreview: FC<{ item: SavedItem, insight: Insight }> = ({ item, insight }) => {
    const deepDive = insight.deepDives.find((_, index) => index === item.deepDiveIndex);

    if (!deepDive) return null;

    return (
        <div className="w-full h-full flex flex-col p-2">
            <Card className="deep-dive-card w-full h-full overflow-hidden flex flex-col">
                 <div className="border-b py-2 text-center">
                    <div className="flex justify-center items-center gap-2">
                        <DynamicIcon name={deepDive.icon} className="size-4 text-primary/70" />
                        <h2 className="font-headline text-sm">{deepDive.title}</h2>
                    </div>
                </div>
                <div className="flex-1 px-2 py-1 overflow-hidden text-sm flex items-center justify-center">
                    <DeepDivePreview deepDive={deepDive} />
                </div>
            </Card>
        </div>
    )
}

const NotePreview: FC<{ note: string }> = ({ note }) => {
    return (
        <div className="w-full h-full p-4 flex flex-col">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex-shrink-0">Your Note</h3>
            <ScrollArea className="flex-grow">
                <p className="text-sm whitespace-pre-wrap">{note}</p>
            </ScrollArea>
        </div>
    )
}


export const SavedItemPreviewCard: FC<SavedItemPreviewCardProps> = ({ item, insight }) => {

    if (!insight) {
        return (
            <Card className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted border">
                <p className="text-xs">Loading...</p>
            </Card>
        );
    }

    const renderContent = () => {
        if (item.type === 'insight') {
            return <InsightPreview insight={insight} />
        }
        if (item.type === 'blog') {
            return <BlogPreview item={item} insight={insight} />
        }
        return <DeepDiveCardPreview item={item} insight={insight} />
    }
    
    const itemTypeLabel = item.type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const hasNote = item.note && item.note.trim().length > 0;

    return (
         <Card className="w-full h-full flex flex-col bg-card border shadow-md transform transition-transform group-hover:scale-105 overflow-hidden">
            <div className="flex-shrink-0 text-center py-1 border-b">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{itemTypeLabel}</p>
            </div>
            <div className={cn("flex-grow relative w-full bg-background/50 rounded-b-md overflow-hidden flex", hasNote && "flex-row")}>
                 <div className={cn("relative flex items-center justify-center", hasNote ? "w-1/2" : "w-full h-full")}>
                     {hasNote ? (
                        <div className="w-full h-full aspect-square">{renderContent()}</div>
                     ) : (
                        <div className="flex items-center justify-center h-full w-full">
                            <div className="w-full aspect-square">{renderContent()}</div>
                        </div>
                     )}
                 </div>
                 {hasNote && (
                     <div className="w-1/2 border-l">
                        <NotePreview note={item.note!} />
                     </div>
                 )}
            </div>
        </Card>
    )
}
