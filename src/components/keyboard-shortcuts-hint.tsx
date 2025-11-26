import React, { useEffect, useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const KeyboardShortcutsHint = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Only show on devices with a fine pointer (mouse/trackpad) - excludes most tablets/phones
        if (typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches) {
            return;
        }

        // Check if hint has been seen in this session
        const hasSeenHint = sessionStorage.getItem('keyboard_hint_seen');
        if (hasSeenHint) return;

        // Show hint after a short delay to allow page load
        const timer = setTimeout(() => {
            setIsVisible(true);
            sessionStorage.setItem('keyboard_hint_seen', 'true');

            // Hide automatically after 6 seconds
            setTimeout(() => setIsVisible(false), 6000);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                    className="fixed bottom-6 right-6 z-50 pointer-events-none hidden lg:block"
                >
                    <div className="bg-background/80 backdrop-blur-xl border border-border/50 p-4 rounded-2xl shadow-2xl flex flex-col gap-3">
                        <div className="flex items-center gap-2 text-muted-foreground mb-1">
                            <Keyboard className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Keyboard Navigation</span>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center gap-1.5">
                                <div className="flex gap-1.5">
                                    <div className="w-8 h-8 flex items-center justify-center bg-muted/50 rounded-lg border border-border/50 shadow-sm">
                                        <ArrowUp className="w-4 h-4 text-foreground" />
                                    </div>
                                </div>
                                <div className="w-8 h-8 flex items-center justify-center bg-muted/50 rounded-lg border border-border/50 shadow-sm">
                                    <ArrowDown className="w-4 h-4 text-foreground" />
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Scroll</span>
                            </div>

                            <div className="h-12 w-px bg-border/50" />

                            <div className="flex flex-col items-center gap-1.5">
                                <div className="flex gap-1.5">
                                    <div className="w-8 h-8 flex items-center justify-center bg-muted/50 rounded-lg border border-border/50 shadow-sm">
                                        <ArrowLeft className="w-4 h-4 text-foreground" />
                                    </div>
                                    <div className="w-8 h-8 flex items-center justify-center bg-muted/50 rounded-lg border border-border/50 shadow-sm">
                                        <ArrowRight className="w-4 h-4 text-foreground" />
                                    </div>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-medium mt-0.5">Navigate</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
