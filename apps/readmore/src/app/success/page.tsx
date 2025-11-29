"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isValidating, setIsValidating] = useState(true);
    const [checkoutId, setCheckoutId] = useState<string | null>(null);

    useEffect(() => {
        const id = searchParams.get("checkout_id");
        setCheckoutId(id);

        // Simulate validation (you could add actual Polar API validation here)
        const timer = setTimeout(() => {
            setIsValidating(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, [searchParams]);

    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-4"
                >
                    <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
                    <p className="text-lg text-muted-foreground">Processing your subscription...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background to-primary/5">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
            >
                <Card className="border-2 border-primary/20 shadow-2xl overflow-hidden">
                    {/* Success Header */}
                    <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center border-b border-primary/20">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center"
                        >
                            <CheckCircle className="w-12 h-12 text-primary" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-4xl md:text-5xl font-bold mb-4"
                        >
                            Welcome to ReadMore<span className="text-primary">+</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-xl text-muted-foreground"
                        >
                            Your subscription is now active!
                        </motion.p>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-6">
                        {checkoutId && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-muted/30 p-4 rounded-lg border border-border"
                            >
                                <p className="text-sm text-muted-foreground mb-1">Checkout ID</p>
                                <p className="font-mono text-sm break-all">{checkoutId}</p>
                            </motion.div>
                        )}

                        {/* Benefits */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="space-y-4"
                        >
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Sparkles className="w-6 h-6 text-primary" />
                                Your Premium Benefits
                            </h2>

                            <div className="grid gap-3">
                                {[
                                    "Unlimited article access",
                                    "Ad-free reading experience",
                                    "Advanced distraction filtering",
                                    "Custom keyword subscriptions",
                                    "Save unlimited articles",
                                    "Priority support"
                                ].map((benefit, index) => (
                                    <motion.div
                                        key={benefit}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.7 + index * 0.1 }}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 border border-border/50"
                                    >
                                        <div className="w-2 h-2 rounded-full bg-primary" />
                                        <span className="text-foreground">{benefit}</span>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 1.3 }}
                            className="pt-4"
                        >
                            <Button
                                size="lg"
                                className="w-full h-14 text-lg rounded-full shadow-lg hover:shadow-xl transition-all group"
                                onClick={() => router.push("/today")}
                            >
                                Start Reading
                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </motion.div>

                        {/* Email Note */}
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.4 }}
                            className="text-center text-sm text-muted-foreground"
                        >
                            A confirmation email with your license key has been sent to your inbox.
                        </motion.p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
