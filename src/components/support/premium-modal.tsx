"use client";

import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { SupportHero } from "@/components/support/support-hero";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FeatureShowcase } from "@/components/support/feature-showcase";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PremiumModalProps {
    isOpen: boolean;
    onClose?: () => void;
}

export function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-screen h-screen max-w-none rounded-none border-none p-0 bg-background/95 backdrop-blur-xl flex flex-col overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="h-full w-full flex flex-col"
                >
                    <DialogClose className="absolute right-6 top-6 z-50 rounded-full bg-background/20 hover:bg-background/40 p-2 transition-colors backdrop-blur-md">
                        <X className="w-6 h-6" />
                        <span className="sr-only">Close</span>
                    </DialogClose>

                    <DialogTitle className="sr-only">Unlock ReadMore+</DialogTitle>
                    <DialogDescription className="sr-only">Support independent development and unlock premium features.</DialogDescription>
                    <ScrollArea className="h-full w-full">
                        <div className="p-6 md:p-10 space-y-12 pb-20 max-w-5xl mx-auto">
                            <SupportHero />
                            <FeatureShowcase />
                        </div>
                    </ScrollArea>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
