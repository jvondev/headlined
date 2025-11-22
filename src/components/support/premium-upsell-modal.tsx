"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { SupportHero } from "./support-hero";
import { FeatureShowcase } from "./feature-showcase";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface PremiumUpsellModalProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: React.ReactNode;
}

export function PremiumUpsellModal({ open, onOpenChange, trigger }: PremiumUpsellModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const isControlled = open !== undefined;
    const isOpen = isControlled ? open : internalOpen;
    const setIsOpen = isControlled ? onOpenChange : setInternalOpen;

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-[100vw] h-[100vh] p-0 border-none rounded-none bg-background overflow-hidden z-[100]">
                <DialogTitle className="sr-only">Premium Upgrade</DialogTitle>
                <div className="relative w-full h-full flex flex-col">
                    <div className="absolute top-4 right-4 z-50">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full bg-background/50 backdrop-blur-sm hover:bg-background/80"
                            onClick={() => setIsOpen && setIsOpen(false)}
                        >
                            <X className="w-6 h-6" />
                        </Button>
                    </div>
                    <ScrollArea className="flex-1 w-full h-full">
                        <div className="pb-20">
                            <SupportHero />
                            <FeatureShowcase />
                        </div>
                    </ScrollArea>
                </div>
            </DialogContent>
        </Dialog>
    );
}
