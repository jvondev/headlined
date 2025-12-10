#!/usr/bin/env node
/**
 * IndexNow Submission Script
 * 
 * Run this script after your scraper updates content or after a build to notify
 * Bing/Yandex of updated URLs. This is a CLI script, not a server function.
 * 
 * Usage:
 *   node scripts/indexnow.mjs
 *   
 * Or integrate into your CI/CD pipeline:
 *   npm run build && node scripts/indexnow.mjs
 * 
 * Environment Variables:
 *   INDEXNOW_KEY - Your IndexNow API key (get from https://www.bing.com/indexnow)
 */

import fs from 'fs';
import path from 'path';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'YOUR_INDEXNOW_KEY_HERE';
const HOST = 'headlined.app';
const MANIFEST_PATH = path.join(process.cwd(), 'src', 'data', 'static-cache', 'manifest.json');

async function submitToIndexNow(urls) {
    if (urls.length === 0) {
        console.log('No URLs to submit.');
        return;
    }

    console.log(`📤 Submitting ${urls.length} URLs to IndexNow...`);

    try {
        const response = await fetch('https://api.indexnow.org/indexnow', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
            },
            body: JSON.stringify({
                host: HOST,
                key: INDEXNOW_KEY,
                keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
                urlList: urls,
            }),
        });

        if (response.ok || response.status === 200 || response.status === 202) {
            console.log(`✅ Successfully submitted ${urls.length} URLs to IndexNow`);
        } else {
            console.error(`❌ IndexNow submission failed: ${response.status} ${await response.text()}`);
        }
    } catch (error) {
        console.error('❌ IndexNow submission error:', error.message);
    }
}

async function main() {
    const urls = [];

    // Add static pages
    urls.push(`https://${HOST}/`);
    urls.push(`https://${HOST}/today`);
    urls.push(`https://${HOST}/this-week`);

    // Add PSEO pages from manifest
    if (fs.existsSync(MANIFEST_PATH)) {
        try {
            const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
            manifest.forEach((item) => {
                const { category, slug } = item.params;
                urls.push(`https://${HOST}/${category}/${slug}`);
            });
            console.log(`📋 Found ${manifest.length} PSEO pages in manifest`);
        } catch (e) {
            console.error('Error reading manifest:', e.message);
        }
    } else {
        console.warn('⚠️ Manifest not found at', MANIFEST_PATH);
    }

    await submitToIndexNow(urls);
}

main();
