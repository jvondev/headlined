"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY_ENABLED = "distraction-free-enabled";
const STORAGE_KEY_KEYWORDS = "distraction-free-keywords";

const DEFAULT_KEYWORDS = ["politics", "gossip", "celebrity", "scandal"];

export function useDistractionSettings() {
    const [enabled, setEnabled] = useState(false);
    const [keywords, setKeywords] = useState<string[]>(DEFAULT_KEYWORDS);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const storedEnabled = localStorage.getItem(STORAGE_KEY_ENABLED);
        const storedKeywords = localStorage.getItem(STORAGE_KEY_KEYWORDS);

        if (storedEnabled !== null) {
            setEnabled(JSON.parse(storedEnabled));
        }
        if (storedKeywords !== null) {
            setKeywords(JSON.parse(storedKeywords));
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
        loaded,
    };
}
