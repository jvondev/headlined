
// (DONT REMOVE BELLOW SAVE COUNT, I WILL NEED IT)
/*
'use server';

import { promises as fs } from 'fs';
import path from 'path';

const saveCountsPath = path.join(process.cwd(), 'src/data/save-counts.json');
const lockFilePath = path.join(process.cwd(), 'save-counts.lock');

type SaveCounts = {
    [itemId: string]: number;
};

// Simple file-based lock to prevent race conditions
async function acquireLock() {
    const startTime = Date.now();
    while (true) {
        try {
            await fs.mkdir(lockFilePath);
            return;
        } catch (e: any) {
            if (e.code !== 'EEXIST') throw e;
            if (Date.now() - startTime > 5000) { // 5 second timeout
                throw new Error('Could not acquire lock on save-counts.json');
            }
            await new Promise(resolve => setTimeout(resolve, 50)); // Wait and retry
        }
    }
}

async function releaseLock() {
    try {
        await fs.rmdir(lockFilePath);
    } catch (e: any) {
        if (e.code !== 'ENOENT') { // Ignore if lock file doesn't exist
            console.error('Error releasing lock:', e);
        }
    }
}

async function readCounts(): Promise<SaveCounts> {
    try {
        await fs.access(saveCountsPath);
        const fileContents = await fs.readFile(saveCountsPath, 'utf8');
        return JSON.parse(fileContents || '{}');
    } catch (error) {
        // If file doesn't exist or is empty, return empty object
        return {};
    }
}

async function writeCounts(counts: SaveCounts): Promise<void> {
    await fs.writeFile(saveCountsPath, JSON.stringify(counts, null, 2), 'utf8');
}

export async function getCount(itemId: string): Promise<number> {
    const counts = await readCounts();
    return counts[itemId] || 0;
}

export async function updateCount(itemId: string, action: 'increment' | 'decrement'): Promise<number> {
    await acquireLock();
    try {
        const counts = await readCounts();
        let currentCount = counts[itemId] || 0;

        if (action === 'increment') {
            currentCount++;
        } else {
            // Ensure count doesn't go below zero
            currentCount = Math.max(0, currentCount - 1);
        }

        counts[itemId] = currentCount;
        await writeCounts(counts);
        return currentCount;
    } finally {
        await releaseLock();
    }
}
*/
