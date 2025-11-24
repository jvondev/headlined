"use client";

import { useState, useEffect } from "react";
import { DISTRACTION_FILTERS } from "@/data/distraction-filters";

const STORAGE_KEY_ENABLED = "distraction-free-enabled";
const STORAGE_KEY_KEYWORDS = "distraction-free-keywords";
const STORAGE_KEY_PRESETS = "distraction-free-presets";

const DEFAULT_KEYWORDS = ["politics", "gossip", "celebrity", "scandal"];

// Initialize presets state from the data file
const INITIAL_PRESETS = DISTRACTION_FILTERS.reduce((acc, filter) => {
    acc[filter.id] = false;
    return acc;
}, {} as Record<string, boolean>);

export function useDistractionSettings() {
    const [enabled, setEnabled] = useState(false);
    const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
    const [presets, setPresets] = useState<Record<string, boolean>>(INITIAL_PRESETS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const storedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED);
        const storedKeywords = localStorage.getItem(STORAGE_KEY_KEYWORDS);
        const storedPresets = localStorage.getItem(STORAGE_KEY_PRESETS);

        if (storedEnabled !== null) {
            try {
                setEnabled(JSON.parse(storedEnabled));
            } catch (e) {
                console.warn("Failed to parse stored enabled state", e);
            }
        }
        if (storedKeywords !== null) {
            try {
                setKeywords(JSON.parse(storedKeywords));
            } catch (e) {
                console.warn("Failed to parse stored keywords", e);
            }
        }
        if (storedPresets !== null) {
            try {
                const parsed = JSON.parse(storedPresets);
                setPresets(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.warn("Failed to parse stored presets", e);
                // Optional: Clear corrupted data
                // localStorage.removeItem(STORAGE_KEY_PRESETS); 
            }
        }
        setLoaded(true);
    }, []);

    const toggleEnabled = (value: boolean) => {
        setEnabled(value);
        localStorage.setItem(STORAGE_KEY_ENABLED, JSON.stringify(value));
    };

    const updateKeywords = (newKeywords: string[]) => {
        setKeywords(newKeywords);
        localStorage.setItem(STORAGE_KEY_KEYWORDS, JSON.stringify(newKeywords));
    };

    const togglePreset = (key: string, isPremium: boolean = false) => {
        setPresets(prev => {
            const isTryingToEnable = !prev[key];
            const activeCount = Object.values(prev).filter(Boolean).length;

            if (!isPremium && isTryingToEnable && activeCount >= 1) {
                // Prevent enabling more than 1 for free users
                return prev;
            }

            const newPresets = { ...prev, [key]: !prev[key] };
            localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(newPresets));
            return newPresets;
        });
    };

    const addKeyword = (keyword: string) => {
        if (!keywords.includes(keyword)) {
            const newKeywords = [...keywords, keyword];
            updateKeywords(newKeywords);
        }
    };

    const removeKeyword = (keyword: string) => {
        const newKeywords = keywords.filter((k) => k !== keyword);
        updateKeywords(newKeywords);
    };

    const enforceSinglePreset = (keepKey: string) => {
        setPresets(prev => {
            const newPresets = Object.keys(prev).reduce((acc, key) => {
                acc[key] = key === keepKey;
                return acc;
            }, {} as Record<string, boolean>);
            localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(newPresets));
            return newPresets;
        });
    };

    const validatePresets = (isPremium: boolean) => {
        setPresets(prev => {
            if (isPremium) return prev;

            const activeKeys = Object.keys(prev).filter(k => prev[k]);
            if (activeKeys.length <= 1) return prev;

            // Keep only the first one
            const keepKey = activeKeys[0];
            const newPresets = Object.keys(prev).reduce((acc, key) => {
                acc[key] = key === keepKey;
                return acc;
            }, {} as Record<string, boolean>);

            localStorage.setItem(STORAGE_KEY_PRESETS, JSON.stringify(newPresets));
            return newPresets;
        });
    };

    const filterDistractions = (posts: any[], isPremium: boolean) => {
        if (!posts || !Array.isArray(posts)) return [];
        if (!enabled) return posts;

        return posts.filter(post => {
            const content = (post.title + " " + (post.description || "")).toLowerCase();

            // Check keywords
            const hasKeyword = keywords.some(keyword => content.includes(keyword.toLowerCase()));
            if (hasKeyword) return false;

            // Check presets
            for (const [presetId, isActive] of Object.entries(presets)) {
                if (isActive) {
                    const preset = DISTRACTION_FILTERS.find(p => p.id === presetId);
                    if (preset && preset.keywords) {
                        const matchesPreset = preset.keywords.some(k => content.includes(k.toLowerCase()));
                        if (matchesPreset) return false;
                    }
                }
            }

            return true;
        });
    };

    return {
        enabled,
        toggleEnabled,
        keywords,
        addKeyword,
        removeKeyword,
        presets,
        togglePreset,
        enforceSinglePreset,
        validatePresets,
        loaded,
        filterDistractions,
    };
}
