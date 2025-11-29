"use client";

import { useState, useEffect } from "react";
import { useDistractionSettings } from "@repo/lib/hooks/use-distraction-settings";
import { Switch } from "@repo/ui/components/ui/switch";
import { Input } from "@repo/ui/components/ui/input";
import { Button } from "@repo/ui/components/ui/button";
import { Badge } from "@repo/ui/components/ui/badge";
import { X, Plus, Zap, Lock, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@repo/ui/components/ui/card";
import { cn } from "@repo/lib/utils/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DISTRACTION_FILTERS } from "@/data/distraction-filters";

export function DistractionSettings({ isPremium, onOpenSupport }: { isPremium: boolean; onOpenSupport?: () => void }) {
    const { enabled, toggleEnabled, keywords, addKeyword, removeKeyword, loaded, presets, togglePreset, validatePresets } = useDistractionSettings();
    const [newKeyword, setNewKeyword] = useState("");
    const [limitOverlayId, setLimitOverlayId] = useState<string | null>(null);

    useEffect(() => {
        if (loaded) {
            validatePresets(isPremium);
        }
    }, [loaded, isPremium, validatePresets]);

    if (!loaded) return null;

    const handleAdd = () => {
        if (newKeyword.trim()) {
            addKeyword(newKeyword.trim().toLowerCase());
            setNewKeyword("");
        }
    };

    const activePresetsCount = Object.values(presets).filter(Boolean).length;
    const isLimitReached = !isPremium && activePresetsCount >= 1;

    return (
        <Card className={cn(
            "w-full relative overflow-hidden transition-all duration-300",
            isPremium
                ? "border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm"
                : "border-border/50 bg-card/50"
        )}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className={cn("p-2 rounded-lg transition-colors", isPremium ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold tracking-tight">Content Filters</CardTitle>
                            <CardDescription className="text-xs font-medium mt-0.5">
                                Customize what you see in your feed
                            </CardDescription>
                        </div>
                    </div>
                    {!isPremium && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary/20 gap-1.5 px-2.5 rounded-full"
                            onClick={onOpenSupport}
                        >
                            <Lock className="w-3 h-3" />
                            Unlock All
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-5">
                {/* Preset Filters Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {DISTRACTION_FILTERS.map((filter) => {
                        const isActive = presets[filter.id];
                        const Icon = filter.icon;
                        const showOverlay = limitOverlayId === filter.id;
                        const isSubtle = !isActive && isLimitReached && !isPremium;

                        return (
                            <div key={filter.id} className="relative h-full">
                                <AnimatePresence mode="wait">
                                    {showOverlay ? (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="absolute inset-0 z-10 bg-card border border-primary/20 rounded-xl flex flex-col items-center justify-center p-2 text-center shadow-sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setLimitOverlayId(null);
                                            }}
                                        >
                                            <span className="text-[10px] font-bold text-muted-foreground mb-1.5">Max 1 Free Filter</span>
                                            <Button
                                                size="sm"
                                                className="h-6 text-[10px] px-3 w-full bg-primary rounded-md text-primary-foreground hover:bg-primary/90"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onOpenSupport?.();
                                                }}
                                            >
                                                Unlock Unlimited
                                            </Button>
                                            <button
                                                className="absolute top-1 right-1 p-1 text-muted-foreground hover:text-foreground"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setLimitOverlayId(null);
                                                }}
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => {
                                                if (!isPremium && !isActive && isLimitReached) {
                                                    setLimitOverlayId(filter.id);
                                                } else {
                                                    togglePreset(filter.id, isPremium);
                                                }
                                            }}
                                            className={cn(
                                                "relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-200 h-full w-full",
                                                isActive
                                                    ? "bg-primary/5 border-primary/50 shadow-sm"
                                                    : "bg-secondary/20 border-border/40 hover:bg-secondary/40 hover:border-border/60",
                                                isSubtle && "opacity-60 grayscale-[0.5] hover:opacity-100 hover:grayscale-0"
                                            )}
                                        >
                                            <div className="flex items-center justify-between w-full mb-2">
                                                <div className={cn(
                                                    "p-1.5 rounded-md",
                                                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                                )}>
                                                    <Icon className="w-3.5 h-3.5" />
                                                </div>
                                                {isActive && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className="bg-primary text-primary-foreground rounded-full p-0.5"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </motion.div>
                                                )}
                                                {!isActive && isLimitReached && !isPremium && (
                                                    <Lock className="w-3 h-3 text-muted-foreground/50" />
                                                )}
                                            </div>
                                            <span className={cn("text-xs font-semibold mb-0.5", isActive ? "text-primary" : "text-foreground")}>
                                                {filter.label}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                                                {filter.description}
                                            </span>
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {!isPremium && (
                    <div className="text-[10px] text-center text-muted-foreground bg-secondary/30 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5">
                        <span>Free Plan: 1 Active Filter</span>
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                        <span className="text-primary font-medium cursor-pointer hover:underline" onClick={onOpenSupport}>Upgrade for Unlimited</span>
                    </div>
                )}

                <div className="h-px bg-border/40 w-full" />

                {/* Custom Keywords Toggle */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                    <div className="flex flex-col gap-1 flex-1 mr-4">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">Custom Keywords</span>
                            {!isPremium && <Lock className="w-3 h-3 text-muted-foreground/60" />}
                        </div>
                        <span className="text-[11px] text-muted-foreground">Hide posts matching specific words</span>
                    </div>

                    <div className="relative h-6 min-w-[44px] flex items-center justify-end">
                        <AnimatePresence mode="wait">
                            {!isPremium && !enabled ? (
                                <motion.button
                                    key="support-btn"
                                    initial={{ opacity: 0, scale: 0.8, width: 44 }}
                                    animate={{ opacity: 1, scale: 1, width: "auto" }}
                                    exit={{ opacity: 0, scale: 0.8, width: 44 }}
                                    className="h-7 px-3 bg-black text-white text-[10px] font-bold rounded-full shadow-md flex items-center gap-1.5 whitespace-nowrap"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onOpenSupport?.();
                                    }}
                                >
                                    <Zap className="w-3 h-3 fill-current" />
                                    Support
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="toggle"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <Switch
                                        checked={enabled}
                                        onCheckedChange={(val) => {
                                            if (!isPremium && val) {
                                                // Should not happen due to the button above replacing the switch when off
                                                onOpenSupport?.();
                                            } else {
                                                toggleEnabled(val);
                                            }
                                        }}
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Custom Keywords Input Area */}
                <AnimatePresence>
                    {enabled && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden pt-1"
                        >
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Add a keyword..."
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                        className="h-9 text-sm bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <Button onClick={handleAdd} size="sm" className="h-9 w-9 p-0 shrink-0" disabled={!newKeyword.trim()}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[32px]">
                                {keywords.length === 0 ? (
                                    <p className="text-[11px] text-muted-foreground italic w-full text-center py-1">
                                        No keywords added yet.
                                    </p>
                                ) : (
                                    keywords.map((keyword) => (
                                        <motion.div
                                            key={keyword}
                                            layout
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            exit={{ scale: 0.8, opacity: 0 }}
                                        >
                                            <Badge variant="outline" className="pl-2 pr-1 py-0.5 gap-1 bg-background hover:bg-muted/50 transition-colors border-border/60 text-xs font-normal">
                                                {keyword}
                                                <button
                                                    onClick={() => removeKeyword(keyword)}
                                                    className="hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </CardContent>
        </Card>
    );
}
