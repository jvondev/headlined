
import { Post } from '@/types';

// Deterministic hash function (DJB2 variant) for stable template selection
function getStableHash(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = (hash * 33) ^ str.charCodeAt(i);
    }
    return Math.abs(hash);
}

// Extract clean source name from URL
function getSourceName(url: string | null): string {
    if (!url) return 'Source';
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace('www.', '').split('.')[0].charAt(0).toUpperCase() + hostname.replace('www.', '').split('.')[0].slice(1);
    } catch (e) {
        return 'Source';
    }
}

// --- Templates ---

interface TemplateSet {
    titles: string[];
    descriptions: string[];
}

// Tier A: High Quality (Full Text available, Long content)
// Intent: Deep Dive, Full Reading, Comprehensive Analysis
const HIGH_QUALITY_TEMPLATES: TemplateSet = {
    titles: [
        "{Title} - Complete Analysis & Full Text",
        "Read: {Title} [Full Story]",
        "Explained: {Title} (Comprehensive Breakdown)",
        "{Title}: What You Need to Know (In-Depth)",
        "Deep Dive: {Title}",
        "{Title} - The Real Story & Details",
        "Full Report: {Title}",
        "Understanding {Title}: Complete Guide",
        "{Title} (No Fluff Version)",
        "Breaking Down: {Title}",
        "{Title}: The Complete Picture",
        "Investigating {Title}: Full Coverage",
        "{Title} - Read the Full Article",
        "Unpacked: {Title}",
        "{Title}: A Detailed Look",
        "The Full Story: {Title}",
        "{Title} - Complete Context",
        "Read Now: {Title}",
        "{Title}: Everything We Know",
        "{Title} (Readable Format)"
    ],
    descriptions: [
        "Read the complete story of \"{Title}\". We provide the full text and comprehensive analysis originally by {Source}.",
        "Don't settle for snippets. Get the full breakdown and text of {Title} here on Headlined.",
        "Deep dive into {Title}. Access the full readable content sourced from {Source} in distraction-free mode.",
        "Unlock the full story: {Title}. Comprehensive coverage, context, and key details available now.",
        "Everything you need to know about {Title}. Read the full analysis key takeaways.",
        "Complete and accessible: Read {Title} by {Source} with our enhanced reader.",
        "The definitive version of {Title}. Full text, dark mode, and improved readability.",
        "Get the whole picture on {Title}. We aggregate the best coverage from {Source} for you.",
        "Read {Title} start to finish. No paywalls, no clutter, just the news.",
        "Full text usage: {Title}. See why this story is trending."
    ]
};

// Tier B: Medium/Short Quality (Short text, Snippets)
// Intent: Summary, Brief, Quick Update, Highlights
const SHORT_CONTENT_TEMPLATES: TemplateSet = {
    titles: [
        "{Title} - Quick Summary",
        "Brief: {Title}",
        "{Title}: Key Highlights",
        "Summary of {Title}",
        "{Title} (Fast Read)",
        "Quick Look: {Title}",
        "The 1-Minute Update: {Title}",
        "{Title} - Key Takeaways",
        "Synopsis: {Title}",
        "{Title} (Digest)",
        "Headline: {Title}",
        "{Title}: What Happened?",
        "Snapshot: {Title}",
        "{Title} - The Basics",
        "Briefing: {Title}",
        "{Title} (Short)",
        "Overview: {Title}",
        "{Title} - Essential Facts",
        "Check this out: {Title}",
        "{Title} (Update)"
    ],
    descriptions: [
        "Quick summary of {Title}. Get the essential facts and key highlights from {Source}.",
        "Short on time? Read the brief synopsis of {Title} here.",
        "Key takeaways from {Title}. We summarize the main points from {Source} for a fast read.",
        "The fast track to understanding {Title}. Read the highlights now.",
        "Get the gist of {Title} in seconds. Aggregated from {Source}.",
        "Brief update: {Title}. The most important details you need to know.",
        "Speed read: {Title}. Essential info without the fluff.",
        "What you need to know about {Title}. A quick overview from Headlined.",
        "Condensed report: {Title}. All the facts, none of the filler.",
        "Latest headline: {Title}. Read the summary in our clean reader."
    ]
};

// Tier C: Link Only (No full text, just redirection/curation)
// Intent: Discovery, Source Linking, Curated List
const LINK_ONLY_TEMPLATES: TemplateSet = {
    titles: [
        "Link: {Title}",
        "{Title} - Read at Source",
        "Curated: {Title}",
        "{Title} (External)",
        "Find: {Title}",
        "Resource: {Title}",
        "{Title} [Link]",
        "Go to: {Title}",
        "{Title} - Web",
        "Discover: {Title}",
        "{Title} (Source)",
        "Reference: {Title}",
        "{Title} - Coverage",
        "Spotlight: {Title}",
        "{Title} - Trending",
        "News: {Title}",
        "{Title} (Item)",
        "Check Source: {Title}",
        "{Title} - Outbound",
        "Story: {Title}"
    ],
    descriptions: [
        "Found on the web: {Title}. Read the original article at {Source}.",
        "Curated link for {Title}. Visit {Source} to read the full story.",
        "We found this interesting: {Title}. Direct link to {Source} coverage.",
        "External resource: {Title}. Available now at the publisher's site.",
        "Headlined curation: {Title}. See the original reporting from {Source}.",
        "Discover {Title}. We direct you to the best source for this topic.",
        "Read {Title} on {Source}. A curated recommendation from Headlined.",
        "Trending now: {Title}. Follow the link to read more.",
        "Source link: {Title}. Get the story directly from the publisher.",
        "Web discovery: {Title}. Explore this topic at {Source}."
    ]
};


export function getSeoMetadata(post: Post) {
    if (!post) return null;

    const hash = getStableHash(post.slug);
    const source = getSourceName(post.link);

    // 1. Determine Quality Tier
    let templateSet = LINK_ONLY_TEMPLATES;
    const textLength = post.fullText?.length || 0;

    if (textLength > 600) {
        templateSet = HIGH_QUALITY_TEMPLATES; // Tier A
    } else if (textLength > 100) {
        templateSet = SHORT_CONTENT_TEMPLATES; // Tier B
    } else {
        templateSet = LINK_ONLY_TEMPLATES; // Tier C
    }

    // 2. Select Template Deterministically
    // We mix the hash to select different indexes for title vs desc
    const titleIndex = hash % templateSet.titles.length;
    const descIndex = (hash * 13) % templateSet.descriptions.length;

    // 3. Format Strings
    const titleTemplate = templateSet.titles[titleIndex];
    const descTemplate = templateSet.descriptions[descIndex];

    const headline = titleTemplate
        .replace(/{Title}/g, post.title)
        .replace(/{Source}/g, source);

    const description = descTemplate
        .replace(/{Title}/g, post.title)
        .replace(/{Source}/g, source);

    return {
        headline,
        description,
        sourceName: source
    };
}
