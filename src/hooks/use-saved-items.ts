
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { SavedItem } from '@/types';

const LOCAL_STORAGE_KEY = 'savedInsightItems';
const HAS_SAVED_KEY_PREFIX = 'hasSaved_';

export function useSavedItems() {
    const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        try {
            const itemsJson = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (itemsJson) {
                setSavedItems(JSON.parse(itemsJson));
            }
        } catch (error) {
            console.error("Failed to load saved items from localStorage", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    const saveToLocalStorage = (items: SavedItem[]) => {
        try {
            const itemsJson = JSON.stringify(items);
            localStorage.setItem(LOCAL_STORAGE_KEY, itemsJson);
        } catch (error) {
            console.error("Failed to save items to localStorage", error);
        }
    };

    const addSavedItem = useCallback((item: Omit<SavedItem, 'savedAt'>) => {
        setSavedItems(prevItems => {
            const existingIndex = prevItems.findIndex(i => i.id === item.id);
            const newItem: SavedItem = {
                ...item,
                savedAt: new Date().toISOString()
            };

            let newItems;
            if (existingIndex > -1) {
                // Update existing item
                newItems = [...prevItems];
                newItems[existingIndex] = { ...newItems[existingIndex], ...newItem };
            } else {
                // Add new item to the beginning
                newItems = [newItem, ...prevItems];
            }
            
            saveToLocalStorage(newItems);
            return newItems;
        });
    }, []);

    const removeSavedItem = useCallback((id: string) => {
        setSavedItems(prevItems => {
            const newItems = prevItems.filter(item => item.id !== id);
            saveToLocalStorage(newItems);
            return newItems;
        });
    }, []);

    const getSavedItem = useCallback((id: string): SavedItem | undefined => {
        return savedItems.find(item => item.id === id);
    }, [savedItems]);

    const isSaved = useCallback((id: string) => {
        return savedItems.some(item => item.id === id);
    }, [savedItems]);

    // --- New functions for tracking client-side save state to prevent duplicate counts ---

    const hasSaved = useCallback((itemId: string): boolean => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem(`${HAS_SAVED_KEY_PREFIX}${itemId}`) === 'true';
    }, []);

    const setHasSaved = useCallback((itemId: string, saved: boolean) => {
        if (typeof window === 'undefined') return;
        if (saved) {
            localStorage.setItem(`${HAS_SAVED_KEY_PREFIX}${itemId}`, 'true');
        } else {
            localStorage.removeItem(`${HAS_SAVED_KEY_PREFIX}${itemId}`);
        }
    }, []);

    return { savedItems, addSavedItem, removeSavedItem, isSaved, getSavedItem, isLoaded, hasSaved, setHasSaved };
}
