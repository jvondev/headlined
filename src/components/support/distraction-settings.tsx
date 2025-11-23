"use client";

import { useState } from "react";
import { useDistractionSettings } from "@/hooks/use-distraction-settings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Sparkles, Lock, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function DistractionSettings({ isPremium }: { isPremium: boolean }) {
    const { enabled, toggleEnabled, keywords, addKeyword, removeKeyword, loaded } = useDistractionSettings();
    const [newKeyword, setNewKeyword] = useState("");

    if (!loaded) return null;

    const handleAdd = () => {
        if (newKeyword.trim()) {
            addKeyword(newKeyword.trim().toLowerCase());
            setNewKeyword("");
        }
    };

    return (
        <Card className={cn(
            "w-full relative overflow-hidden transition-all duration-300",
            isPremium
                ? "border-primary/20 bg-gradient-to-br from-primary/5 via-card to-card shadow-sm hover:shadow-md"
                : "border-border/50 bg-card/50 grayscale-[0.5] hover:grayscale-0"
        )}>
            {/* Premium Locked Overlay */}
            {!isPremium && (
                <div className="absolute inset-0 z-20 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6 transition-opacity duration-300 hover:bg-background/40">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/30 dark:to-amber-900/10 p-4 rounded-full shadow-sm mb-3 border border-amber-200/50 dark:border-amber-700/30"
                    >
                        <Lock className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                    </motion.div>
                    <h3 className="font-bold text-lg tracking-tight mb-1">Unlock Focus Mode</h3>
                    <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed mb-4">
                        Take control of your feed. Filter out noise and focus on what matters to you.
                    </p>
                    <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0 shadow-md rounded-full px-6">
                        <Sparkles className="w-3.5 h-3.5 mr-2 fill-current" />
                        Upgrade to Pro
                    </Button>
                </div>
            )}

            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className={cn("p-2 rounded-lg transition-colors", isPremium ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                            <Zap className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle className="text-lg font-bold tracking-tight">Focus Control</CardTitle>
                            <CardDescription className="text-xs font-medium mt-0.5">
                                Curate your reading experience
                            </CardDescription>
                        </div>
                    </div>
                    {isPremium && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0 px-2.5 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                            Pro Active
                        </Badge>
                    )}
                </div>
            </CardHeader>

            <CardContent className={cn("space-y-6", !isPremium && "opacity-40 pointer-events-none blur-[1px]")}>
                <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50">
                    <Label htmlFor="distraction-mode" className="flex flex-col gap-1 cursor-pointer">
                        <span className="font-semibold text-sm">Distraction-Free Mode</span>
                        <span className="text-[11px] text-muted-foreground">Hide posts matching your keywords</span>
                    </Label>
                    <Switch
                        id="distraction-mode"
                        checked={enabled}
                        onCheckedChange={toggleEnabled}
                        disabled={!isPremium}
                        className="data-[state=checked]:bg-primary"
                    />
                </div>

                <AnimatePresence>
                    {enabled && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        placeholder="Add a keyword to block..."
                                        value={newKeyword}
                                        onChange={(e) => setNewKeyword(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                        disabled={!isPremium}
                                        className="pr-8 bg-background/50 focus:bg-background transition-colors"
                                    />
                                </div>
                                <Button onClick={handleAdd} size="icon" className="shrink-0" disabled={!isPremium || !newKeyword.trim()}>
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[40px]">
                                {keywords.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic w-full text-center py-2">
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
                                            <Badge variant="outline" className="pl-2.5 pr-1 py-1 gap-1.5 bg-background hover:bg-muted/50 transition-colors border-border/60 text-sm font-normal">
                                                {keyword}
                                                <button
                                                    onClick={() => removeKeyword(keyword)}
                                                    className="hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-colors"
                                                    disabled={!isPremium}
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
