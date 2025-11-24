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
    const { enabled, toggleEnabled, keywords, addKeyword, removeKeyword, loaded, presets, togglePreset } = useDistractionSettings();
    const [newKeyword, setNewKeyword] = useState("");
    const [activeSupportToggle, setActiveSupportToggle] = useState<string | null>(null);

    if (!loaded) return null;

    const handleAdd = () => {
        if (newKeyword.trim()) {
            addKeyword(newKeyword.trim().toLowerCase());
            setNewKeyword("");
        }
    };

    const handleToggleClick = (id: string, currentVal: boolean, setter: () => void) => {
        if (isPremium) {
            setter();
        } else {
            setActiveSupportToggle(id);
        }
    };

    const renderToggleItem = (id: string, label: string, description: string, checked: boolean, onToggle: () => void) => {
        const showSupport = activeSupportToggle === id && !isPremium;

        return (
            <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 transition-all duration-300">
                <div className="flex flex-col gap-1 flex-1 mr-4">
                    <span className="font-semibold text-sm">{label}</span>
                    <span className="text-[11px] text-muted-foreground line-clamp-1">{description}</span>
                </div>

                <div className="relative h-6 min-w-[44px] flex items-center justify-end">
                    <AnimatePresence mode="wait">
                        {showSupport ? (
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
                                    checked={checked}
                                    onCheckedChange={() => handleToggleClick(id, checked, onToggle)}
                                    className="data-[state=checked]:bg-primary"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        );
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

            <CardContent className="space-y-3">
                {/* Preset Filters */}
                {renderToggleItem(
                    "celebrity",
                    "Celebrity Gossip",
                    "Filter out celebrity news and gossip",
                    presets.celebrity,
                    () => togglePreset("celebrity")
                )}

                {renderToggleItem(
                    "worldNews",
                    "World News",
                    "Filter out disasters, conflicts, etc.",
                    presets.worldNews,
                    () => togglePreset("worldNews")
                )}

                {renderToggleItem(
                    "politics",
                    "Political Noise",
                    "Filter out political debates and opinions",
                    presets.politics,
                    () => togglePreset("politics")
                )}

                {/* Custom Keywords Toggle */}
                {renderToggleItem(
                    "custom",
                    "Custom Keywords",
                    "Hide posts matching specific words",
                    enabled,
                    (val) => toggleEnabled(val ?? !enabled) // Switch passes boolean, but our toggleEnabled expects boolean. Wait, Switch onCheckedChange passes boolean.
                )}

                {/* Custom Keywords Input Area */}
                <AnimatePresence>
                    {enabled && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden pt-2"
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
