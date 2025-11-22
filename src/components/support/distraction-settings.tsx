"use client";

import { useState, useEffect } from "react";
import { useDistractionSettings } from "@/hooks/use-distraction-settings";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { checkLicenseStatus } from "@/lib/license-manager";

export function DistractionSettings() {
    const { enabled, toggleEnabled, keywords, addKeyword, removeKeyword, loaded } = useDistractionSettings();
    const [newKeyword, setNewKeyword] = useState("");
    const [isPremium, setIsPremium] = useState(false);

    useEffect(() => {
        checkLicenseStatus().then(setIsPremium);
    }, []);

    if (!loaded) return null;

    if (!isPremium) return null;

    const handleAdd = () => {
        if (newKeyword.trim()) {
            addKeyword(newKeyword.trim().toLowerCase());
            setNewKeyword("");
        }
    };

    return (
        <Card className="w-full border-primary/20 bg-primary/5">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    <CardTitle className="text-lg">Distraction Control</CardTitle>
                </div>
                <CardDescription>
                    Filter out content containing specific keywords.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                    <Label htmlFor="distraction-mode" className="flex flex-col gap-1">
                        <span className="font-medium">Enable Distraction-Free Mode</span>
                        <span className="text-xs text-muted-foreground">Hide posts matching your keywords</span>
                    </Label>
                    <Switch
                        id="distraction-mode"
                        checked={enabled}
                        onCheckedChange={toggleEnabled}
                    />
                </div>

                {enabled && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Add keyword (e.g. politics)..."
                                value={newKeyword}
                                onChange={(e) => setNewKeyword(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            />
                            <Button onClick={handleAdd} size="icon" variant="secondary">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {keywords.map((keyword) => (
                                <Badge key={keyword} variant="outline" className="pl-2 pr-1 py-1 gap-1 bg-background">
                                    {keyword}
                                    <button
                                        onClick={() => removeKeyword(keyword)}
                                        className="hover:bg-muted rounded-full p-0.5 transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
