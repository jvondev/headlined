
"use client";

import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetClose } from "@repo/ui/components/ui/sheet";
import { Button } from "@repo/ui/components/ui/button";
import TextareaAutosize from "react-textarea-autosize";
import type { SavedItem } from "@/types";
import { X, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface SaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemToSave: Omit<SavedItem, 'savedAt' | 'note'>;
  initialNote?: string;
  onSave: (item: Omit<SavedItem, 'savedAt'>) => void;
  onRemove: (id: string) => void;
}

export function SaveDialog({ open, onOpenChange, itemToSave, initialNote, onSave, onRemove }: SaveDialogProps) {
  const [note, setNote] = useState(initialNote || "");

  // This effect ensures the note state is reset when the item being edited changes.
  useEffect(() => {
    if (open) {
      setNote(initialNote || "");
    }
  }, [open, initialNote, itemToSave.id]);

  const handleSave = () => {
    // Only save if the note has actually changed
    if (note.trim() !== (initialNote || "").trim()) {
      onSave({ ...itemToSave, note: note.trim() });
    }
    onOpenChange(false);
  };
  
  const handleRemove = () => {
    onRemove(itemToSave.id);
    onOpenChange(false);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      // Smart close logic: if the note has been changed, save it.
      // This covers cases where the user swipes away or closes the dialog without hitting save.
      if (note.trim() !== (initialNote || "").trim()) {
         handleSave();
      }
    }
    onOpenChange(isOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent 
        side="bottom" 
        className={cn(
          "rounded-t-lg p-0 flex flex-col h-auto max-h-[75vh] sm:max-h-[60vh] z-[70]"
        )}
        onOpenAutoFocus={(e: Event) => e.preventDefault()}
      >
        <SheetHeader className="flex flex-row items-center justify-between p-2 border-b text-center sticky top-0 bg-background">
            <SheetTitle className="text-base font-semibold truncate px-2 flex-1 text-center ml-9">
              {itemToSave.title}
            </SheetTitle>
        </SheetHeader>
        <div className="flex-1 p-4 pb-0 overflow-y-auto">
          <TextareaAutosize
            placeholder="What's on your mind? Why is this important?"
            value={note}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
            className="w-full resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-base bg-transparent no-scrollbar"
            autoFocus
            minRows={1}
            maxRows={12}
          />
        </div>
        <div className="border-t p-2 flex gap-2 sticky bottom-0 bg-background">
             <Button type="button" variant="destructive" className="w-1/4" onClick={handleRemove}>
                Remove
            </Button>
            <Button type="button" variant="default" className="w-3/4" onClick={handleSave}>
                <Save className="mr-2 size-4" />
                Save Note
            </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
