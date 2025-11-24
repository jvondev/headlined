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
            setEnabled(JSON.parse(storedEnabled));
        }
        if (storedKeywords !== null) {
            setKeywords(JSON.parse(storedKeywords));
        }
        if (storedPresets !== null) {
            const parsed = JSON.parse(storedPresets);
            setPresets(prev => ({ ...prev, ...parsed }));
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

    return {
        enabled,
        toggleEnabled,
        keywords,
        addKeyword,
        removeKeyword,
        presets,
        togglePreset,
        loaded,
    };
}
