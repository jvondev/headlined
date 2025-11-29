"use client";

import { useState, useEffect, useCallback } from 'react';

const LOCAL_STORAGE_KEY = 'postPreferences';

type Preferences = {
    [topic_id: string]: number; // e.g., 'uuid-123': 1, 'uuid-456': -1
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

    const addPreference = useCallback((topic_id: string, preference: 'like' | 'dislike') => {
        setPreferences(prevPrefs => {
            const newPrefs = { ...prevPrefs };
            const currentValue = newPrefs[topic_id] || 0;
            
            if (preference === 'like') {
                newPrefs[topic_id] = currentValue + 1;
            } else {
                newPrefs[topic_id] = currentValue - 1;
            }

            saveToLocalStorage(newPrefs);
            return newPrefs;
        });
    }, []);

    const getPreferenceScore = useCallback((topic_id: string) => {
        return preferences[topic_id] || 0;
    }, [preferences]);

    return { preferences, addPreference, getPreferenceScore, isLoaded };
}
