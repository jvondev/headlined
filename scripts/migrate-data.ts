import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const OLD_REPO = 'xupgudxup/BUg-7d8-diua-sdadh89-';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

function stripHTMLAndKeep3Paragraphs(htmlOrText: string | null): string {
    if (!htmlOrText) return '';
    // Strip HTML tags roughly
    let text = htmlOrText.replace(/<[^>]*>?/gm, '\n');
    // Split by newlines, clean up empty ones
    const paragraphs = text.split('\n').map(p => p.trim()).filter(p => p.length > 0);
    // Keep only first 3 paragraphs
    const kept = paragraphs.slice(0, 3).join(' ');
    // Remove tabs and newlines so it doesn't break TSV
    return kept.replace(/\t/g, ' ').replace(/\n/g, ' ');
}

async function runMigration() {
    if (!GITHUB_TOKEN) {
        console.error("❌ GITHUB_TOKEN is not set. Please set it to run migration.");
        process.exit(1);
    }

    console.log(`Starting migration from ${OLD_REPO} to local TSV.GZ files...`);

    const contentsUrl = `https://api.github.com/repos/${OLD_REPO}/contents/output`;
    const res = await fetch(contentsUrl, {
        headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json' }
    });

    if (!res.ok) {
        console.error("❌ Failed to fetch old repo contents:", await res.text());
        process.exit(1);
    }

    const files = await res.json();
    const jsonFiles = files.filter((f: any) => f.name.match(/^\d{4}-\d{2}-\d{2}\.json$/));

    console.log(`Found ${jsonFiles.length} daily JSON files to migrate.`);

    const outputDir = path.join(process.cwd(), 'data-migration-output');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    for (const file of jsonFiles) {
        console.log(`📥 Downloading ${file.name}...`);
        const fileRes = await fetch(file.download_url);
        const posts = await fileRes.json();
        
        if (!Array.isArray(posts) || posts.length === 0) continue;

        const year = file.name.substring(0, 4);
        const yearDir = path.join(outputDir, `rss-data-${year}`);
        if (!fs.existsSync(yearDir)) fs.mkdirSync(yearDir, { recursive: true });

        // 1. Process posts
        const processedPosts = posts.map(post => {
            return {
                ...post,
                description: stripHTMLAndKeep3Paragraphs(post.description || post.content || ''),
                // Ensure no tabs or newlines in any field
                title: (post.title || '').replace(/\t|\n/g, ' '),
                url: (post.url || post.link || '').replace(/\t|\n/g, ''),
                image: (post.image || post.thumbnail_url || '').replace(/\t|\n/g, ''),
                topic: (post.topic || '').replace(/\t|\n/g, '')
            };
        });

        // 2. Convert to TSV
        const headers = ['title', 'description', 'url', 'image', 'topic'];
        const tsvLines = [headers.join('\t')];
        for (const post of processedPosts) {
            const row = headers.map(h => post[h] || '');
            tsvLines.push(row.join('\t'));
        }
        const tsvText = tsvLines.join('\n');

        // 3. GZIP it
        const gzipped = zlib.gzipSync(tsvText);

        // 4. Save file
        const outName = file.name.replace('.json', '.tsv.gz');
        const outPath = path.join(yearDir, outName);
        fs.writeFileSync(outPath, gzipped);
        
        const origSize = JSON.stringify(posts).length;
        const newSize = gzipped.length;
        console.log(`   ✅ Saved ${outName} | ${Math.round(origSize/1024)}KB -> ${Math.round(newSize/1024)}KB (${Math.round(newSize/origSize * 100)}% size)`);
    }

    console.log(`\n🎉 Migration complete! Files saved to ./data-migration-output/`);
    console.log(`To deploy these: copy the folders inside data-migration-output into your 'data' branch and push!`);
}

runMigration().catch(console.error);
