
// Load environment variables from .env.local
import { config } from 'dotenv';
config({ path: '.env.local' });

import { gatherGroundingData, formatGroundingContext } from '../src/lib/data-grounding';

/**
 * Test grounding and analyze Gemini suitability
 */
async function main() {
    const keyword = process.argv[2] || 'best AI tools 2025';
    console.log(`\n🔍 Testing: "${keyword}"`);
    console.log('━'.repeat(60));

    const start = Date.now();
    const data = await gatherGroundingData(keyword);
    const duration = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`\n📊 RAW DATA STATS (${duration}s):`);
    console.log(`   SERP Results: ${data.serpResults.length}`);
    console.log(`   Wikipedia: ${data.wikiSummary ? `✅ ${data.wikiSummary.length} chars` : '❌'}`);
    console.log(`   Instant Answer: ${data.instantAnswer ? `✅ ${data.instantAnswer.length} chars` : '❌'}`);
    console.log(`   Scraped Articles: ${data.articleContent.length}`);

    if (data.serpResults.length > 0) {
        console.log(`\n📋 SERP RESULTS:`);
        data.serpResults.forEach((r, i) => {
            console.log(`   ${i + 1}. ${r.title.slice(0, 50)}...`);
        });
    }

    // Format for Gemini
    const context = await formatGroundingContext(data);

    // Token analysis
    const chars = context.length;
    const words = context.split(/\s+/).length;
    const estTokens = Math.ceil(chars / 4); // Conservative estimate

    console.log(`\n📏 GEMINI INPUT ANALYSIS:`);
    console.log(`   Characters: ${chars.toLocaleString()}`);
    console.log(`   Words: ${words.toLocaleString()}`);
    console.log(`   Est. Tokens: ~${estTokens.toLocaleString()}`);
    console.log(`   Gemini 2.5 Flash Limit: 1,048,576 tokens`);
    console.log(`   Usage: ${((estTokens / 1048576) * 100).toFixed(4)}%`);

    // Suitability check
    console.log(`\n✅ GEMINI SUITABILITY:`);
    if (estTokens < 2000) {
        console.log(`   ✅ EXCELLENT - Very light context (${estTokens} tokens)`);
        console.log(`   ✅ Leaves 99.8%+ capacity for generation`);
    } else if (estTokens < 5000) {
        console.log(`   ✅ GOOD - Moderate context (${estTokens} tokens)`);
        console.log(`   ✅ Leaves 99.5%+ capacity for generation`);
    } else if (estTokens < 10000) {
        console.log(`   ⚠️ OK - Heavy context (${estTokens} tokens)`);
        console.log(`   Consider reducing article scraping limits`);
    } else {
        console.log(`   ❌ TOO HEAVY - ${estTokens} tokens`);
        console.log(`   Needs optimization`);
    }

    // Show formatted context preview
    console.log(`\n📝 FORMATTED CONTEXT PREVIEW (first 1000 chars):`);
    console.log('━'.repeat(60));
    console.log(context.slice(0, 1000));
    if (context.length > 1000) console.log(`\n... [${context.length - 1000} more chars]`);
    console.log('━'.repeat(60));
}

main().catch(console.error);
