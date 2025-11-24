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

export function DistractionSettings({ isPremium, onOpenSupport }: { isPremium: boolean; onOpenSupport?: () => void }) {
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
                            <CardTitle className="text-lg font-bold tracking-tight">Focus Control</CardTitle>
                            <CardDescription className="text-xs font-medium mt-0.5">
                                Curate your reading experience
                            </CardDescription>
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-6">
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
                                    {!isPremium && (
                                        <div className="absolute inset-y-0 right-3 flex items-center text-muted-foreground">
                                            <Lock className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>
                                <Button onClick={handleAdd} size="icon" className="shrink-0" disabled={!newKeyword.trim() || !isPremium}>
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
                                                    disabled={!isPremium}
                                                    className="hover:bg-destructive/10 hover:text-destructive rounded-full p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

                {!isPremium && (
                    <div className="flex items-center justify-between pt-1 border-t border-border/40">
                        <p className="text-[10px] text-muted-foreground font-medium">
                            Support development to enable filtering.
                        </p>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-[10px] text-primary hover:text-primary/80 font-bold hover:bg-transparent"
                            onClick={onOpenSupport}
                        >
                            Open Support
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
