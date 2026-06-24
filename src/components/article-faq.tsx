'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { FAQItem } from '@/types/article';
import { cn } from '@/lib/utils';

interface ArticleFAQProps {
    faq: FAQItem[];
}

export function ArticleFAQ({ faq }: ArticleFAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    if (!faq || faq.length === 0) return null;

    // JSON-LD for Google SEO FAQ Schema
    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faq.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <section className="my-12 py-8 border-t border-zinc-100">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <HelpCircle className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-zinc-900 m-0">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-4">
                {faq.map((item, index) => (
                    <div
                        key={index}
                        className={cn(
                            "rounded-xl border transition-all duration-200 overflow-hidden",
                            openIndex === index
                                ? "bg-zinc-50 border-zinc-200"
                                : "bg-white border-zinc-100 hover:border-zinc-200"
                        )}
                    >
                        <button
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                            className="w-full px-6 py-4 flex items-center justify-between text-left group"
                        >
                            <span className={cn(
                                "text-base font-semibold transition-colors",
                                openIndex === index ? "text-primary" : "text-zinc-800 group-hover:text-zinc-900"
                            )}>
                                {item.question}
                            </span>
                            <ChevronDown className={cn(
                                "w-5 h-5 text-zinc-400 transition-transform duration-200",
                                openIndex === index && "rotate-180 text-primary"
                            )} />
                        </button>
                        <AnimatePresence>
                            {openIndex === index && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                >
                                    <div className="px-6 pb-4 text-zinc-600 leading-relaxed text-base">
                                        {item.answer}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ))}
            </div>

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />
        </section>
    );
}
