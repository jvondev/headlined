"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
                    <div
                        key={index}
                        className="border border-border rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm transition-colors hover:bg-card"
                    >
                        <button
                            onClick={() => setOpenIndex(isOpen ? null : index)}
                            className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left transition-colors"
                        >
                            <span className="font-semibold text-sm md:text-base leading-snug">
                                {faq.q}
                            </span>
                            <motion.div
                                animate={{ rotate: isOpen ? 180 : 0 }}
                                transition={{ duration: 0.2 }}
                                className="shrink-0"
                            >
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            </motion.div>
                        </button>

                        <AnimatePresence initial={false}>
                            {isOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                >
                                    <div className="px-5 pb-4 pt-1 text-sm md:text-base text-muted-foreground leading-relaxed">
                                        {faq.a}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })}
        </div>
    );
}
