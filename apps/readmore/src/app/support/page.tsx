import { SupportHero } from "@/components/support/support-hero";
import { FeatureShowcase } from "@/components/support/feature-showcase";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Support ReadMore+ | Pay What You Want",
    description: "Support independent development and unlock premium features with ReadMore+.",
};

export default function SupportPage() {
    return (
        <main className="min-h-screen bg-background">
            <SupportHero />
            <FeatureShowcase />

            <div className="py-12 text-center text-muted-foreground text-sm">
                <p>© {new Date().getFullYear()} ReadMore. All rights reserved.</p>
                <p className="mt-2">Thank you for supporting independent software.</p>
            </div>
        </main>
    );
}
