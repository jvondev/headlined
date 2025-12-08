"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface FaqItem {
    q: string;
    a: string;
}

interface FaqAccordionProps {
    faqs: FaqItem[];
}

export function FaqAccordion({ faqs }: FaqAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!faqs || faqs.length === 0) return null;

    return (
        <div className="space-y-3">
            {faqs.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group border-b border-border/40 last:border-0 p-4"
                    >
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            className="w-full flex items-center justify-between gap-4 text-left transition-colors group-hover:text-primary"
                        >
                            <span className="font-medium text-base leading-snug text-foreground/90 group-hover:text-foreground">
                                {faq.q}
                            </span>
                            <div className={cn(
                                "shrink-0 p-1.5 rounded-full transition-colors",
                                isOpen ? "bg-primary/10 text-primary" : "bg-transparent text-muted-foreground group-hover:bg-foreground/5"
                            )}>
                                <motion.div
                                    animate={{ rotate: isOpen ? 180 : 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ChevronDown className="w-4 h-4" />
                                </motion.div>
                            </div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="pb-6 pt-0 text-muted-foreground leading-relaxed text-sm md:text-base pr-8">
                                        {faq.a}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
        </div>
    );
}
