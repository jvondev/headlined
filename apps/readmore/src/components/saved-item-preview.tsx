import type { Post, SavedItem } from "@/types";
import { FC } from "react";
import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { DynamicIcon } from "./dynamic-icon";
import { BookText } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";


interface SavedItemPreviewCardProps {
    item: SavedItem;
    post: Post | null;
}

const PostPreview: FC<{ post: Post }> = ({ post }) => {
    return (
        <div className="relative w-full h-full text-foreground flex flex-col justify-center items-center text-center p-4">
            {post.thumbnail_url && (
                <>
                    <img
                        src={post.thumbnail_url}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60" />
                </>
            )}
            <div className={cn("relative", post.thumbnail_url && "text-white")}>
                <h2 className="font-headline text-lg font-bold leading-tight">{post.title}</h2>
            </div>
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


export const SavedItemPreviewCard: FC<SavedItemPreviewCardProps> = ({ item, post }) => {

    if (!post) {
        return (
            <Card className="w-full h-full flex items-center justify-center text-muted-foreground bg-muted border">
                <p className="text-xs">Loading...</p>
            </Card>
        );
    }

    const renderContent = () => {
        return <PostPreview post={post} />
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