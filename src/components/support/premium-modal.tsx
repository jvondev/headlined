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
            <DialogContent className="w-screen h-screen max-w-none rounded-none border-none p-0 bg-background/95 backdrop-blur-xl flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full data-[state=open]:slide-in-from-bottom-full duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]">
                <DialogClose className="absolute right-6 top-6 z-50 rounded-full bg-background/20 hover:bg-background/40 p-2 transition-colors backdrop-blur-md">
                    <X className="w-6 h-6" />
                    <span className="sr-only">Close</span>
                </DialogClose>

                <DialogTitle className="sr-only">Unlock ReadMore+</DialogTitle>
                <DialogDescription className="sr-only">Support independent development and unlock premium features.</DialogDescription>

                <ScrollArea className="h-full w-full">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={{
                            hidden: { opacity: 0 },
                            visible: {
                                opacity: 1,
                                transition: {
                                    staggerChildren: 0.15,
                                    delayChildren: 0.3
                                }
                            }
                        }}
                        className="p-6 md:p-10 space-y-12 pb-20 max-w-5xl mx-auto"
                    >
                        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } } }}>
                            <SupportHero />
                        </motion.div>
                        <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } } }}>
                            <FeatureShowcase />
                        </motion.div>
                    </motion.div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    );
}
