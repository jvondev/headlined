import fs from 'fs';
import path from 'path';

const OLD_REPO = 'xupgudxup/BUg-7d8-diua-sdadh89-';
const NEW_REPO = 'jvondev/Headlined';

// You must set GITHUB_TOKEN in your environment or .env.local
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function runMigration() {
    if (!GITHUB_TOKEN) {
        console.error("❌ GITHUB_TOKEN is not set. Please set it to run migration.");
        process.exit(1);
    }

    console.log(`Starting migration from ${OLD_REPO} to ${NEW_REPO} releases...`);

    // 1. Fetch list of files from old repo output/ directory
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

    // Group by year
    const filesByYear: Record<string, any[]> = {};
    for (const file of jsonFiles) {
        const year = file.name.substring(0, 4);
        if (!filesByYear[year]) filesByYear[year] = [];
        filesByYear[year].push(file);
    }

    // 2. Download and upload for each year
    for (const [year, files] of Object.entries(filesByYear)) {
        const releaseTag = `rss-data-${year}`;
        console.log(`\n📦 Processing Year ${year} (${files.length} files) -> Release: ${releaseTag}`);

        // Check if release exists, if not create it
        let releaseId = null;
        let uploadUrl = null;

        const relRes = await fetch(`https://api.github.com/repos/${NEW_REPO}/releases/tags/${releaseTag}`, {
            headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}` }
        });

        if (relRes.ok) {
            const release = await relRes.json();
            releaseId = release.id;
            uploadUrl = release.upload_url.split('{')[0];
            console.log(`Release ${releaseTag} exists. ID: ${releaseId}`);
        } else {
            console.log(`Creating release ${releaseTag}...`);
            const createRes = await fetch(`https://api.github.com/repos/${NEW_REPO}/releases`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github.v3+json', 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tag_name: releaseTag,
                    name: `RSS Data Archive ${year}`,
                    body: `Historical RSS chunks for ${year}.`,
                    draft: false,
                    prerelease: false
                })
            });
            if (!createRes.ok) {
                console.error(`❌ Failed to create release ${releaseTag}:`, await createRes.text());
                continue;
            }
            const release = await createRes.json();
            releaseId = release.id;
            uploadUrl = release.upload_url.split('{')[0];
            console.log(`✅ Created release ${releaseTag}.`);
        }

        // Process files
        for (const file of files) {
            console.log(`  Downloading ${file.name}...`);
            const fileRes = await fetch(file.download_url);
            const fileData = await fileRes.arrayBuffer();

            console.log(`  Uploading ${file.name}...`);
            const uploadReqUrl = `${uploadUrl}?name=${file.name}`;
            
            const upRes = await fetch(uploadReqUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                    'Content-Length': fileData.byteLength.toString()
                },
                body: fileData
            });

            if (upRes.ok) {
                console.log(`  ✅ Uploaded ${file.name} to ${releaseTag}`);
            } else {
                const errText = await upRes.text();
                if (errText.includes('already_exists')) {
                    console.log(`  ⚠️ File ${file.name} already exists in release. Skipping.`);
                } else {
                    console.error(`  ❌ Failed to upload ${file.name}:`, errText);
                }
            }
        }
    }

    console.log("\n🎉 Migration Complete!");
}

runMigration().catch(console.error);
