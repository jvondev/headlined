
"use client";

import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'insightPreferences';

type Preferences = {
    [category: string]: number; // e.g., 'Tech': 1, 'Design': -1
};

export function usePreferences() {
    const [preferences, setPreferences] = useState<Preferences>({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const itemsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (itemsJson) {
                setPreferences(JSON.parse(itemsJson));
            }
        } catch (error) {
            console.error("Failed to load preferences from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveToLocalStorage = (prefs: Preferences) => {
        try {
            const prefsJson = JSON.stringify(prefs);
            localStorage.setItem(LOCAL_STORAGE_KEY, prefsJson);
        } catch (error) {
            console.error("Failed to save preferences to localStorage", error);
        }
    };

    const addPreference = useCallback((category: string, preference: 'like' | 'dislike') => {
        setPreferences(prevPrefs => {
            const newPrefs = { ...prevPrefs };
            const currentValue = newPrefs[category] || 0;
            
            if (preference === 'like') {
                newPrefs[category] = currentValue + 1;
            } else {
                newPrefs[category] = currentValue - 1;
            }

            saveToLocalStorage(newPrefs);
            return newPrefs;
        });
    }, []);

    const getPreferenceScore = useCallback((category: string) => {
        return preferences[category] || 0;
    }, [preferences]);

    return { preferences, addPreference, getPreferenceScore, isLoaded };
}
