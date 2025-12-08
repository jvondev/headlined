"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// ============================================================================
// MERGE OUTPUTS - Combines batch artifacts into final daily file
// Used by GitHub Actions after parallel batch jobs complete
// ============================================================================
const ARTIFACTS_DIR = process.env.ARTIFACTS_DIR || path.join(__dirname, '../artifacts');
const OUTPUT_DIR = path.join(__dirname, '../output');
const INDEX_FILE = path.join(OUTPUT_DIR, 'index.json');
async function mergeOutputs() {
    console.log('Starting merge of batch outputs...');
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    // Load existing index
    let index = [];
    if (fs.existsSync(INDEX_FILE)) {
        try {
            index = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
        }
        catch {
            console.log('Could not read index, starting fresh.');
        }
    }
    const indexSet = new Set(index);
    // Fingerprint set for deduplication
    const fingerprints = new Set();
    // Today's merged data
    const today = new Date().toISOString().split('T')[0];
    const dailyFile = path.join(OUTPUT_DIR, `${today}.json`);
    let mergedPosts = [];
    // Load existing daily data if any
    if (fs.existsSync(dailyFile)) {
        try {
            mergedPosts = JSON.parse(fs.readFileSync(dailyFile, 'utf-8'));
            // Build fingerprints from existing posts
            for (const post of mergedPosts) {
                if (post.fullText) {
                    fingerprints.add(post.fullText.substring(0, 100));
                }
            }
        }
        catch {
            console.log('Could not read daily file, starting fresh.');
        }
    }
    // Find all artifact directories
    if (!fs.existsSync(ARTIFACTS_DIR)) {
        console.log('No artifacts directory found.');
        return;
    }
    const batchDirs = fs.readdirSync(ARTIFACTS_DIR)
        .filter(d => d.startsWith('output-'))
        .map(d => path.join(ARTIFACTS_DIR, d));
    console.log(`Found ${batchDirs.length} batch artifacts.`);
    for (const batchDir of batchDirs) {
        // Look for daily JSON files in each batch output
        const files = fs.readdirSync(batchDir)
            .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.json$/));
        for (const file of files) {
            try {
                const content = fs.readFileSync(path.join(batchDir, file), 'utf-8');
                const posts = JSON.parse(content);
                for (const post of posts) {
                    // Skip if already indexed
                    if (indexSet.has(post.link))
                        continue;
                    // Deduplication by content fingerprint
                    if (post.fullText) {
                        const fingerprint = post.fullText.substring(0, 100);
                        if (fingerprints.has(fingerprint))
                            continue;
                        fingerprints.add(fingerprint);
                    }
                    mergedPosts.push(post);
                    indexSet.add(post.link);
                }
            }
            catch (e) {
                console.error(`Error reading ${file}:`, e);
            }
        }
        // Also copy error logs if present
        const errorLog = path.join(batchDir, 'error-log.json');
        if (fs.existsSync(errorLog)) {
            const mainErrorLog = path.join(OUTPUT_DIR, 'error-log.json');
            let errors = [];
            if (fs.existsSync(mainErrorLog)) {
                try {
                    errors = JSON.parse(fs.readFileSync(mainErrorLog, 'utf-8'));
                }
                catch { }
            }
            try {
                const batchErrors = JSON.parse(fs.readFileSync(errorLog, 'utf-8'));
                errors.push(...batchErrors);
            }
            catch { }
            fs.writeFileSync(mainErrorLog, JSON.stringify(errors, null, 2), 'utf-8');
        }
    }
    // Sort by created_at (newest first)
    mergedPosts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    // Write merged output
    fs.writeFileSync(dailyFile, JSON.stringify(mergedPosts, null, 2), 'utf-8');
    fs.writeFileSync(INDEX_FILE, JSON.stringify(Array.from(indexSet), null, 2), 'utf-8');
    console.log(`Merge complete. Total posts: ${mergedPosts.length}`);
}
mergeOutputs().catch(console.error);
