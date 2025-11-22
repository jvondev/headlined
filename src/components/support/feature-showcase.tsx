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
                    beforeImage: "",
                    afterImage: "",
                    beforeTitle: "Today's News Only",
                    beforeDescription: "You can only see the current day's news feed. Yesterday's stories are gone.",
                    afterTitle: "7-Day Archive",
                    afterDescription: "Travel back in time. Access full news feeds from the past week."
                },
                {
                    title: "Analytics Dashboard",
                    description: "Track your reading habits with a 30-day history dashboard.",
                    beforeLabel: "Basic Stats",
                    afterLabel: "30-Day Insights",
                    beforeImage: "",
                    afterImage: "",
                    beforeTitle: "Basic Stats",
                    beforeDescription: "View simple read counts for the current session.",
                    afterTitle: "30-Day Insights",
                    afterDescription: "Deep dive into your reading habits with a full month of analytics and trends."
                },
            ],
        },
        {
            category: "Reading Experience",
            items: [
                {
                    title: "Ad-Free Experience",
                    description: "Enjoy a completely seamless reading experience without any interruptions.",
                    beforeLabel: "With Ads",
                    afterLabel: "Ad-Free",
                    beforeImage: "",
                    afterImage: "",
                    beforeTitle: "Standard Experience",
                    beforeDescription: "Occasional sponsored content and ads in your feed.",
                    afterTitle: "Pure Content",
                    afterDescription: "Zero ads. Zero interruptions. Just the content you love."
                },
                {
                    title: "Distraction Control",
                    description: "Filter out noise. Block specific keywords or topics that you don't want to see.",
                    beforeLabel: "Unfiltered",
                    afterLabel: "Focused",
                    beforeImage: "",
                    afterImage: "",
                    beforeTitle: "Noisy Feed",
                    beforeDescription: "See everything, including topics or keywords you might find distracting or annoying.",
                    afterTitle: "Zen Mode",
                    afterDescription: "Custom filters block unwanted keywords (e.g., 'politics', 'spoilers') for a peaceful reading experience."
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
                    beforeTitle: "Broad Topics",
                    beforeDescription: "Subscribe to general categories like 'Technology' or 'Health'.",
                    afterTitle: "Specific Keywords",
                    afterDescription: "Follow niche interests like 'SpaceX', 'Vegan Recipes', or 'ReactJS'."
                },
                {
                    title: "Theme Customization",
                    description: "Personalize your reading experience with custom colors.",
                    beforeLabel: "Light Mode",
                    afterLabel: "Custom Themes",
                    beforeImage: "",
                    afterImage: "",
                    beforeTitle: "Default Theme",
                    beforeDescription: "Standard light/dark mode experience.",
                    afterTitle: "Personalized Look",
                    afterDescription: "Customize accent colors and themes to match your style."
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
                    beforeTitle: "Single List",
                    beforeDescription: "All saved posts are dumped into one long, unorganized list.",
                    afterTitle: "Smart Collections",
                    afterDescription: "Create custom folders and groups to organize your saved content."
                },
                {
                    title: "Cross-Device Sync (Coming Soon)",
                    description: "Sync your local data across all your devices seamlessly.",
                    beforeLabel: "Local Only",
                    afterLabel: "Cloud Sync",
                    beforeImage: "",
                    afterImage: "",
                    beforeTitle: "Local Storage",
                    beforeDescription: "Data lives on this device only. Lost if you clear cache.",
                    afterTitle: "Cloud Sync (coming soon)",
                    afterDescription: "Seamlessly pick up where you left off on any device."
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
                    beforeTitle: "Standard Feedback",
                    beforeDescription: "Submit requests via standard channels.",
                    afterTitle: "Priority Feedback",
                    afterDescription: "Your feature requests and bug reports get top priority."
                },
                {
                    title: "Support Solo Development",
                    description: "Directly support the ongoing development of ReadMore.",
                    beforeLabel: "User",
                    afterLabel: "Patron",
                    beforeImage: "",
                    afterImage: "",
                    beforeTitle: "Free User",
                    beforeDescription: "Enjoying the app for free.",
                    afterTitle: "Patron",
                    afterDescription: "Directly funding the developer's coffee and server costs to keep ReadMore alive."
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
                                        beforeTitle={item.beforeTitle}
                                        beforeDescription={item.beforeDescription}
                                        afterTitle={item.afterTitle}
                                        afterDescription={item.afterDescription}
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
