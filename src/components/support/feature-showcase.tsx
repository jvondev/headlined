"use client";

import { BeforeAfterCard } from "./before-after-card";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";

export function FeatureShowcase() {
    const features = [
        {
            category: "History & Archives",
            items: [
                {
                    title: "Weekly History Access",
                    description: "Go back in time. Access news from today up to 7 days ago.",
                    beforeLabel: "Today Only",
                    afterLabel: "7-Day History",
                    beforeImage: "", // Placeholder or asset path if available
                    afterImage: "", // Placeholder
                },
                {
                    title: "Analytics Dashboard",
                    description: "Track your reading habits with a 30-day history dashboard.",
                    beforeLabel: "Basic Stats",
                    afterLabel: "30-Day Insights",
                    beforeImage: "",
                    afterImage: "",
                },
            ],
        },
        {
            category: "Personalization",
            items: [
                {
                    title: "Custom Keywords",
                    description: "Subscribe to specific keywords, not just broad topics.",
                    beforeLabel: "Fixed Topics",
                    afterLabel: "Custom Keywords",
                    beforeImage: "",
                    afterImage: "",
                },
                {
                    title: "Theme Customization",
                    description: "Personalize your reading experience with custom colors.",
                    beforeLabel: "Light Mode",
                    afterLabel: "Custom Themes",
                    beforeImage: "",
                    afterImage: "",
                },
            ],
        },
        {
            category: "Organization",
            items: [
                {
                    title: "Group Saved Posts",
                    description: "Organize your saved posts into custom groups for easy access.",
                    beforeLabel: "Unsorted List",
                    afterLabel: "Smart Groups",
                    beforeImage: "",
                    afterImage: "",
                },
                {
                    title: "Cross-Device Sync (Coming Soon)",
                    description: "Sync your local data across all your devices seamlessly.",
                    beforeLabel: "Local Only",
                    afterLabel: "Cloud Sync",
                    beforeImage: "",
                    afterImage: "",
                },
            ],
        },
        {
            category: "Exclusive Access",
            items: [
                {
                    title: "Priority Updates",
                    description: "Get your feature requests prioritized by the developer.",
                    beforeLabel: "Standard",
                    afterLabel: "Priority Access",
                    beforeImage: "",
                    afterImage: "",
                },
                {
                    title: "Support Solo Development",
                    description: "Directly support the ongoing development of ReadMore.",
                    beforeLabel: "User",
                    afterLabel: "Patron",
                    beforeImage: "",
                    afterImage: "",
                },
            ],
        },
    ];

    return (
        <div className="py-16 px-4 md:px-8 max-w-6xl mx-auto">
            {features.map((section, idx) => (
                <div key={idx}>
                    <div className="space-y-12">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60"
                        >
                            {section.category}
                        </motion.h2>
                        <div className="space-y-8">
                            {section.items.map((item, itemIdx) => (
                                <motion.div
                                    key={itemIdx}
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: "-100px" }}
                                    transition={{ duration: 0.5, delay: itemIdx * 0.1 }}
                                >
                                    <BeforeAfterCard
                                        title={item.title}
                                        description={item.description}
                                        beforeLabel={item.beforeLabel}
                                        afterLabel={item.afterLabel}
                                        beforeImage={item.beforeImage}
                                        afterImage={item.afterImage}
                                    />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                    {idx < features.length - 1 && (
                        <Separator className="max-w-xs mx-auto my-24 opacity-50" />
                    )}
                </div>
            ))}
        </div>
    );
}
