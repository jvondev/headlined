"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Slider } from "@repo/ui/components/ui/slider";
import { Button } from "@repo/ui/components/ui/button";
import { Switch } from "@repo/ui/components/ui/switch";
import { Label } from "@repo/ui/components/ui/label";
import { PolarCheckout } from "./polar-checkout";
import { LicenseValidationModal } from "./license-validation-modal";
import { Heart, Sparkles, Zap, Crown } from "lucide-react";
import { DistractionSettings } from "./distraction-settings";

export function SupportHero() {
    const [amount, setAmount] = useState(10);
    const [isYearly, setIsYearly] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);

    // Non-linear slider mapping
    // 0-50 -> $1-$20
    // 50-100 -> $21-$100
    const getSliderValue = (amt: number) => {
        if (amt <= 20) {
            return (amt / 20) * 50;
        }
        return 50 + ((amt - 20) / 80) * 50;
    };

    const getAmountFromSlider = (val: number) => {
        if (val <= 50) {
            return Math.max(1, Math.round((val / 50) * 20));
        }
        return Math.round(20 + ((val - 50) / 50) * 80);
    };

    const handleSliderChange = (value: number[]) => {
        setAmount(getAmountFromSlider(value[0]));
    };

    // Calculate final amount based on billing cycle
    // Yearly is 10x monthly amount (effectively 2 months free/discounted logic per user request)
    const finalAmount = isYearly ? amount * 10 : amount;
    const originalYearlyPrice = amount * 12;

    // Polar Checkout Links
    const monthlyUrl = process.env.NEXT_PUBLIC_POLAR_MONTHLY_URL || "https://buy.polar.sh/polar_cl_9b2TeBrM4fRQLvqVcsikaMeKbw4N8gCtBPUHo0jtmTe";
    const yearlyUrl = process.env.NEXT_PUBLIC_POLAR_YEARLY_URL || "https://buy.polar.sh/polar_cl_MflXTRUGLq0mqHpAAPztuknrtCsgVuMAnEfZL3K8frO";

    const baseUrl = isYearly ? yearlyUrl : monthlyUrl;

    // Amount in cents
    const checkoutUrl = `${baseUrl}?amount=${finalAmount * 100}`;

    const handlePresetClick = (val: number) => {
        setAmount(val);
    };

    const getMessage = (amt: number) => {
        if (amt >= 11) return {
            text: "Thank you for making a significant impact! Please reach out for priority feedback and feature requests.",
            icon: <Crown className="w-6 h-6 text-primary" />,
            color: "bg-card border-primary/20 text-foreground shadow-sm"
        };
        if (amt >= 6) return {
            text: "Thank you for helping this project grow! Your support directly funds development and updates.",
            icon: <Zap className="w-6 h-6 text-primary" />,
            color: "bg-card border-primary/20 text-foreground shadow-sm"
        };
        if (amt >= 3) return {
            text: "Thank you for your support! Your contribution goes directly toward covering project costs.",
            icon: <Heart className="w-6 h-6 text-primary" />,
            color: "bg-card border-primary/20 text-foreground shadow-sm"
        };
        return {
            text: "We're glad to have you here! Thank you for joining our support community.",
            icon: <Sparkles className="w-6 h-6 text-primary" />,
            color: "bg-card border-primary/20 text-foreground shadow-sm"
        };
    };

    const message = getMessage(amount);

    return (
        <div className="w-full max-w-3xl mx-auto py-12 px-4 text-center space-y-8">
            <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                    Support <span className="text-primary">ReadMore+</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Pay what you want to unlock premium features and support independent development.
                </p>
            </div>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center space-x-4">
                <span className={`text-sm font-medium ${!isYearly ? "text-foreground" : "text-muted-foreground"}`}>Monthly</span>
                <Switch
                    checked={isYearly}
                    onCheckedChange={setIsYearly}
                    className="data-[state=checked]:bg-primary"
                />
                <span className={`text-sm font-medium ${isYearly ? "text-foreground" : "text-muted-foreground"}`}>
                    Yearly <span className="text-xs text-green-600 font-bold ml-1">(Save ~17%)</span>
                </span>
            </div>

            {/* Amount Display */}
            <div className="relative py-8 flex flex-col items-center justify-center">
                <div className="flex items-baseline gap-2">
                    {isYearly && (
                        <span className="text-2xl text-muted-foreground line-through decoration-destructive/50">
                            ${originalYearlyPrice}
                        </span>
                    )}
                    <div className="text-7xl font-black text-foreground tabular-nums tracking-tighter">
                        ${finalAmount}
                        <span className="text-2xl font-medium text-muted-foreground ml-2">/{isYearly ? "yr" : "mo"}</span>
                    </div>
                </div>
            </div>

            {/* Preset Buttons */}
            <div className="flex justify-center gap-3">
                {[3, 5, 10].map((val) => (
                    <Button
                        key={val}
                        variant={amount === val ? "default" : "outline"}
                        onClick={() => handlePresetClick(val)}
                        className="rounded-full px-6"
                    >
                        ${val}
                    </Button>
                ))}
            </div>

            {/* Slider */}
            <div className="max-w-md mx-auto px-4">
                <Slider
                    value={[getSliderValue(amount)]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={handleSliderChange}
                    className="cursor-pointer"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>$1</span>
                    <span>$100</span>
                </div>
            </div>

            {/* Dynamic Message */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={message.text}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`flex items-center justify-center gap-3 p-4 rounded-xl border ${message.color} max-w-lg mx-auto transition-colors duration-300`}
                >
                    {message.icon}
                    <span className="font-medium text-sm md:text-base text-left">{message.text}</span>
                </motion.div>
            </AnimatePresence>

            {/* CTA Button */}
            <div className="pt-4 flex flex-col items-center gap-4">
                <Button
                    size="lg"
                    className="w-full max-w-xs text-lg h-14 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                    onClick={() => setShowCheckout(true)}
                >
                    Support Now
                </Button>

                <LicenseValidationModal />
            </div>

            {showCheckout && (
                <PolarCheckout
                    checkoutUrl={checkoutUrl}
                    onClose={() => setShowCheckout(false)}
                    onSuccess={() => {
                        setShowCheckout(false);
                        // Could add a toast or redirect here
                    }}
                />
            )}
        </div>
    );
}
