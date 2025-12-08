import { CategoryId, getKeywordFromSlug } from './seo-keywords';

// Re-export CategoryId for compatibility
export type { CategoryId };

// Define advanced template structure
interface SeoTemplateFull {
    // Variations to prevent duplicate content patterns
    titleVariations: string[];
    descriptionVariations: string[];
    h1Variations: string[];
    introVariations: string[];

    // FAQ Generation Templates
    faqTemplates: { q: string; a: string }[];
}

// Helper to pick a consistent variation based on slug hash
function pickVariation(slug: string, variations: string[]): string {
    if (!variations || variations.length === 0) return "";
    let hash = 0;
    for (let i = 0; i < slug.length; i++) {
        hash = ((hash << 5) - hash) + slug.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
    }
    return variations[Math.abs(hash) % variations.length];
}

export const SEO_CONFIG: Record<CategoryId, SeoTemplateFull> = {
    location: {
        titleVariations: [
            "{Title} News: Latest {Title} Updates & Live Coverage",
            "{Title} Breaking News | Local Politics, Weather & Events",
            "Latest News in {Title} Today | Real-time Updates",
            "{Title} Daily News Tracker: What You Need to Know",
            "News from {Title}: Comprehensive Local Coverage"
        ],
        descriptionVariations: [
            "Stay informed with the latest breaking news from {Title}. Real-time coverage of local politics, economy, community events, and daily developments.",
            "Complete coverage of {Title} news. We aggregate trusted sources to bring you the top stories, weather alerts, and cultural events happening in {Title}.",
            "Discover what's happening in {Title} right now. Your daily guide to local news, traffic, investigative reports, and community stories.",
            "Real-time {Title} news tracker. Follow the latest developments in politics, business, and local life from verified sources."
        ],
        h1Variations: [
            "{Title} News",
            "Latest from {Title}",
            "{Title}: Today's Headlines",
            "{Title} News Feed"
        ],
        introVariations: [
            "Explore the latest happenings in {Title}. This feed tracks real-time updates from verified local and international sources.",
            "Your central hub for {Title} news. We monitor thousands of sources to bring you the stories that matter most in the region.",
            "Stay ahead with our {Title} news tracker. From breaking alerts to in-depth analysis, get the full picture of what's unfolding."
        ],
        faqTemplates: [
            { q: "What is happening in {Title} right now?", a: "Our {Title} feed is updated continuously with the latest breaking news, local events, and community developments from verified sources." },
            { q: "Where can I find reliable {Title} news?", a: "We aggregate news from top local and national publications to provide a comprehensive and balanced view of current events in {Title}." },
            { q: "How often are {Title} updates posted?", a: "New stories for {Title} are added 24/7 as they break, ensuring you always have the most current information available." }
        ]
    },
    people: {
        titleVariations: [
            "{Title} News & Latest Updates | {Aliases}",
            "{Title} Tracker: Recent Statements & Events",
            "Latest News About {Title}: Complete Timeline",
            "{Title} Today: Breaking News & Analysis",
            "What {Title} Did Today: Latest Reports"
        ],
        descriptionVariations: [
            "Track the latest news and updates regarding {Title}. Timelines, statements, and analysis from top media sources aggregating real-time coverage.",
            "Follow {Title}'s latest moves. Comprehensive coverage including recent statements, public appearances, and impact analysis.",
            "Stay updated on {Title}. We curate the most important stories, interviews, and breaking news involving {Title} from around the web.",
        ],
        h1Variations: [
            "{Title}: Latest Updates",
            "{Title} In The News",
            "Tracking {Title}",
            "{Title} Watch"
        ],
        introVariations: [
            "Follow the latest developments regarding {Title}. Our tracker aggregates news, statements, and analysis to provide a complete picture.",
            "Latest headlines and analysis focusing on {Title}. Keep up with recent activities and public statements.",
            "Comprehensive news coverage of {Title}, bringing together reports from diverse perspectives."
        ],
        faqTemplates: [
            { q: "What is the latest news about {Title}?", a: "Check our live feed for the most recent updates, statements, and developments concerning {Title}." },
            { q: "Why is {Title} trending today?", a: "{Title} is frequently in the news due to their influential role. Our analysis breaks down the key factors driving today's headlines." }
        ]
    },
    media: {
        titleVariations: [
            "{Title} News & Media Coverage | Latest Reports",
            "{Title} Updates: Press Releases & Headlines",
            "Latest from {Title}: News & Analysis",
            "Media Watch: {Title} Breaking Stories"
        ],
        descriptionVariations: [
            "Recent stories and reports from {Title}. Analysis of media coverage, press releases, and major headlines involving {Title}.",
            "Get the latest updates on {Title}. We track media mentions, corporate announcements, and industry analysis.",
            "Your guide to {Title} in the news. Comprehensive coverage of recent projects, controversies, and corporate developments."
        ],
        h1Variations: [
            "{Title} Media Watch",
            "{Title} Coverage",
            "News About {Title}",
            "{Title} Headlines"
        ],
        introVariations: [
            "Latest reports and headlines involving {Title}. Track media perception and corporate narratives.",
            "Stay updated with the latest news from and about {Title}. Analysis of recent coverage and announcements."
        ],
        faqTemplates: [
            { q: "What are the latest updates from {Title}?", a: "Read the most recent press releases, media coverage, and corporate announcements regarding {Title}." }
        ]
    },
    team: {
        titleVariations: [
            "{Title} News, Scores & Roster Updates",
            "{Title} Latest: Games, Trades & Rumors",
            "Official {Title} News & Team Updates",
            "{Title} Fan Hub: Latest Reports"
        ],
        descriptionVariations: [
            "Get the latest {Title} news, game results, trade rumors, and injury reports. Comprehensive coverage for fans.",
            "Follow the {Title} all season long. Scores, highlights, roster changes, and locker room news.",
            "The ultimate source for {Title} updates. We aggregate local beat writers and national coverage for complete team news."
        ],
        h1Variations: [
            "{Title} News & Updates",
            "{Title} Headquarters",
            "{Title} Report",
            "All Things {Title}"
        ],
        introVariations: [
            "All the latest news, scores, and updates for the {Title}. Keep track of the team's performance and offseason moves.",
            "Dedicated coverage of the {Title}. From game day analysis to trade rumors, we have it covered."
        ],
        faqTemplates: [
            { q: "When is the next {Title} game?", a: "Check our feed for the latest schedule updates, game previews, and post-game analysis for {Title}." }
        ]
    },
    topics: {
        titleVariations: [
            "Latest {Title} News & Global Trends",
            "{Title} Deep Dive: Analysis & Breaking Stories",
            "Understanding {Title}: News & Insights",
            "{Title} Watch: Trends Shaping the World"
        ],
        descriptionVariations: [
            "Deep dive into {Title}. Trends, analysis, and breaking stories shaping the world of {Title}.",
            "Stay current with major developments in {Title}. Expert analysis and global perspectives on key issues.",
            "Comprehensive coverage of {Title}. From emerging trends to major headlines, get the full story here."
        ],
        h1Variations: [
            "{Title} Insights",
            "World of {Title}",
            "{Title} Explained",
            "Latest in {Title}"
        ],
        introVariations: [
            "Latest trends and analysis in {Title}. Explore the stories that are defining this topic right now.",
            "A curated feed of the most important {Title} news. Diverse perspectives on the issues that matter."
        ],
        faqTemplates: [
            { q: "What are the current trends in {Title}?", a: "Our {Title} section tracks emerging patterns, major announcements, and expert analysis to keep you ahead of the curve." }
        ]
    },
    industry: {
        titleVariations: [
            "{Title} Industry News & Market Analysis",
            "{Title} Sector Updates: Trends & Companies",
            "State of the {Title} Industry: Latest Reports",
            "{Title} Business Intelligence & News"
        ],
        descriptionVariations: [
            "Professional coverage of the {Title} industry. Market trends, corporate moves, and economic analysis.",
            "Stay competitive with the latest {Title} industry news. Mergers, acquisitions, innovations, and regulatory updates.",
            "In-depth analysis of the {Title} sector. We track the major players and market forces shaping the industry."
        ],
        h1Variations: [
            "{Title} Insights",
            "{Title} Market Watch",
            "Business of {Title}",
            "{Title} Sector News"
        ],
        introVariations: [
            "Market analysis and corporate news for the {Title} sector. Keep a pulse on the industry.",
            "Strategic insights into the {Title} industry. Monitoring key developments and market shifts."
        ],
        faqTemplates: [
            { q: "Is the {Title} industry growing?", a: "Follow our market analysis and economic reports to track growth trends and investment opportunities in the {Title} sector." }
        ]
    },
    interest: {
        titleVariations: [
            "{Title} Guide: News, Tips & Trends for Enthusiasts",
            "Discover {Title}: Latest Updates & How-Tos",
            "The World of {Title}: News & Inspiration",
            "{Title} Daily: Trends & Community News"
        ],
        descriptionVariations: [
            "Discover the latest in {Title}. News, guides, and trends for enthusiasts and professionals alike.",
            "Your daily dose of {Title}. Tips, inspiration, and community updates curated for you.",
            "Stay connected to the {Title} world. New releases, expert advice, and trending topics."
        ],
        h1Variations: [
            "{Title} Hub",
            "Explore {Title}",
            "{Title} Illustrated",
            "Life & {Title}"
        ],
        introVariations: [
            "Updates and trends for {Title} enthusiasts. Dive deeper into your passion with our curated feed.",
            "Explore the vibrant world of {Title}. Connect with the latest ideas and community highlights."
        ],
        faqTemplates: [
            { q: "How do I get started with {Title}?", a: "Our {Title} feed offers a mix of beginner guides, expert tips, and the latest news to help you navigate the field." }
        ]
    },
    company: {
        titleVariations: [
            "{Title} Company News | Stock, Products & Press",
            "{Title} Corporate Updates: What's Happening",
            "Latest on {Title}: Business & Tech News",
            "{Title} Investor Relations & News Feed"
        ],
        descriptionVariations: [
            "Latest news about {Title}. Stock market performance, product announcements, and corporate updates.",
            "Track {Title}'s business performance. Revenue reports, executive changes, and strategic moves.",
            "Everything happening at {Title}. From product launches to market impact, get the full brief."
        ],
        h1Variations: [
            "{Title} Corporate News",
            "Inside {Title}",
            "{Title} Business Update",
            "{Title} Stock & News"
        ],
        introVariations: [
            "Latest announcements and market moves from {Title}. Keeping investors and fans informed.",
            "Corporate news and product updates from {Title}. Track the company's trajectory here."
        ],
        faqTemplates: [
            { q: "How is {Title} performing in the market?", a: "We track {Title}'s stock performance, earnings reports, and market share to provide a clear picture of their standing." }
        ]
    },
    event: {
        titleVariations: [
            "{Title} Live Updates & News Coverage",
            "{Title} Tracker: Results & Highlights",
            "Follow the {Title}: News & Analysis",
            "Latest on {Title}: What You Missed"
        ],
        descriptionVariations: [
            "Follow {Title} live. Real-time updates, results, and comprehensive news coverage of the event.",
            "Complete guide to the {Title}. Schedules, winners, highlights, and behind-the-scenes news.",
            "Don't miss a moment of the {Title}. We aggregate coverage to bring you the best highlights and updates."
        ],
        h1Variations: [
            "{Title} Live Coverage",
            "{Title} Center",
            "{Title} Updates",
            "The {Title}"
        ],
        introVariations: [
            "Real-time updates and news for {Title}. Experience the event as it happens.",
            "Comprehensive coverage of the {Title}. Highlights, results, and expert commentary."
        ],
        faqTemplates: [
            { q: "When does the {Title} start?", a: "Check our feed for the full schedule and live countdowns to key moments in the {Title}." }
        ]
    },
    product: {
        titleVariations: [
            "{Title} News, Reviews & Release Dates",
            "{Title} Rumors & Updates: What's New",
            "The New {Title}: Features & Specs",
            "{Title} Launch In-Depth Coverage"
        ],
        descriptionVariations: [
            "Everything about {Title}. Latest rumors, release dates, reviews, and feature updates.",
            "Is the {Title} worth it? Read reviews, compare specs, and find the best deals.",
            "Stay updated on {Title}. Software updates, tips, tricks, and the latest accessories."
        ],
        h1Variations: [
            "{Title} Updates",
            "All About {Title}",
            "{Title} Review & News",
            "The {Title} Hub"
        ],
        introVariations: [
            "News, reviews, and updates for {Title}. Get the most out of your tech.",
            "Deep dive into the {Title}. Features, specs, and the latest user guides."
        ],
        faqTemplates: [
            { q: "When is the next {Title} release?", a: "We track all rumors and official announcements to give you the most accurate release date predictions for new {Title} models." }
        ]
    },
    legal: {
        titleVariations: [
            "{Title} Legal News & Court Updates",
            "{Title} Watch: Lawsuits & Rulings",
            "Legal Monitor: {Title} Case Updates",
            "{Title} Regulations & Compliance News"
        ],
        descriptionVariations: [
            "Latest legal developments regarding {Title}. Court rulings, lawsuits, and regulatory updates.",
            "Track important cases involving {Title}. Expert legal analysis and real-time court reporting.",
            "Understanding the legal landscape of {Title}. Legislation, compliance, and major verdicts."
        ],
        h1Variations: [
            "{Title} Legal Monitor",
            "{Title} In Court",
            "Law & {Title}",
            "{Title} Docket"
        ],
        introVariations: [
            "Tracking legal developments and court rulings related to {Title}. Stay informed on the legal front.",
            "Expert analysis of laws and regulations affecting {Title}. Breaking down complex legal news."
        ],
        faqTemplates: [
            { q: "Are there active lawsuits regarding {Title}?", a: "Our monitor tracks ongoing litigation and court filings relevant to {Title}." }
        ]
    },
    demographic: {
        titleVariations: [
            "News & Resources for {Title}",
            "{Title} Lifestyle: Trends & Insights",
            "The {Title} Report: News & Culture",
            "Updates for {Title}: What Matters Now"
        ],
        descriptionVariations: [
            "Curated news and resources relevant to {Title}. Trends, policy changes, and opportunities.",
            "A voice for {Title}. Stories, interviews, and news that impacts this community.",
            "Connecting {Title} with relevant information. Financial tips, lifestyle trends, and community news."
        ],
        h1Variations: [
            "{Title} Insights",
            "For {Title}",
            "{Title} Community",
            "The {Title} Beat"
        ],
        introVariations: [
            "News and resources tailored for {Title}. Empowering the community with information.",
            "A dedicated space for {Title}. Explore stories that resonate with your experience."
        ],
        faqTemplates: [
            { q: "What resources are available for {Title}?", a: "We curate a list of programs, grants, and opportunities specifically designed to support {Title}." }
        ]
    },
    government: {
        titleVariations: [
            "{Title} News & Official Announcements",
            "{Title} Watch: Policy & Operations",
            "Inside the {Title}: Latest Reports",
            "{Title} Briefing: Today's Updates"
        ],
        descriptionVariations: [
            "Latest updates from {Title}. Policy announcements, press releases, and official statements.",
            "Monitor the activities of the {Title}. Transparency, reports, and public service announcements.",
            "Understanding {Title} policies. Breaking news and in-depth analysis of government actions."
        ],
        h1Variations: [
            "{Title} Briefing",
            "{Title} Headquarters",
            "Official {Title} News",
            "{Title} Monitor"
        ],
        introVariations: [
            "Official news and policy updates from {Title}. Keeping citizens informed about government operations.",
            "Tracking the latest directives and announcements from {Title}."
        ],
        faqTemplates: [
            { q: "What is the role of the {Title}?", a: "Our guide explains the mandate and current initiatives of the {Title}." }
        ]
    },
    weather: {
        titleVariations: [
            "{Title} Alert: News, Forecast & Impact",
            "{Title} Watch: Safety & Updates",
            "Tracking {Title}: Live Path & News",
            "{Title} Emergency Info & News"
        ],
        descriptionVariations: [
            "Urgent {Title} updates. Forecasts, safety warnings, and impact reports.",
            "Stay safe during {Title}. Real-time tracking, evacuation orders, and recovery news.",
            "Comprehensive {Title} coverage. Science, safety tips, and live reporting from affected areas."
        ],
        h1Variations: [
            "{Title} Watch",
            "{Title} Alert Center",
            "Tracking {Title}",
            "{Title} Update"
        ],
        introVariations: [
            "Forecasts and safety updates for {Title}. Critical information when it matters most.",
            "Monitoring {Title} developments. Stay prepared with our live tracker."
        ],
        faqTemplates: [
            { q: "Is there a {Title} warning in effect?", a: "Check the top of our feed for active alerts and safety warnings regarding {Title}." }
        ]
    },
    education: {
        titleVariations: [
            "{Title} News & Academic Updates",
            "{Title} Life: Campus News & Research",
            "The {Title} Report: Education News",
            "{Title} Trends: Future of Learning"
        ],
        descriptionVariations: [
            "Latest news from {Title}. Research, admissions, and campus updates.",
            "Inside {Title}. Student life, faculty achievements, and administrative announcements.",
            "The future of {Title}. Trends in education, tuition, and academic research."
        ],
        h1Variations: [
            "{Title} News",
            "{Title} Today",
            "Academy of {Title}",
            "{Title} Journal"
        ],
        introVariations: [
            "Academic and campus updates from {Title}. Celebrating knowledge and innovation.",
            "News from the world of {Title}. Keeping students and alumni connected."
        ],
        faqTemplates: [
            { q: "How do I apply to {Title}?", a: "Find admissions guides, deadlines, and requirements for {Title} in our resources section." }
        ]
    },
    science: {
        titleVariations: [
            "{Title} Research & Scientific Breakthroughs",
            "Discovering {Title}: New Studies & Findings",
            "The Future of {Title}: Science News",
            "{Title} Lab: Latest Experiments & Data"
        ],
        descriptionVariations: [
            "Latest discoveries in {Title}. Research papers, scientific breakthroughs, and expert analysis.",
            "Explore the frontiers of {Title}. New technologies, theories, and cosmic discoveries.",
            "Science news about {Title}. Validating the facts and exploring the unknown."
        ],
        h1Variations: [
            "{Title} Research",
            "{Title} Frontiers",
            "Science of {Title}",
            "{Title} Lab"
        ],
        introVariations: [
            "Scientific breakthroughs and research in {Title}. Pushing the boundaries of human knowledge.",
            "Deep dives into {Title} research. Understanding the universe one discovery at a time."
        ],
        faqTemplates: [
            { q: "What are the latest discoveries in {Title}?", a: "We cover recent peer-reviewed papers and major scientific announcements in the field of {Title}." }
        ]
    },
    conflict: {
        titleVariations: [
            "{Title} Conflict News & Security Updates",
            "{Title} Front: Live Reporting & Maps",
            "Global Security: {Title} Crisis Updates",
            "{Title} Situation Report: Daily Briefing"
        ],
        descriptionVariations: [
            "Monitoring {Title}. Security assessments, live conflict reporting, and geopolitical analysis.",
            "Updates on the {Title} situation. Maps, strategy analysis, and humanitarian reports.",
            "Critical news regarding {Title}. Understanding the global impact and security implications."
        ],
        h1Variations: [
            "{Title} Monitor",
            "{Title} Conflict Update",
            "{Title} Crisis Watch",
            "Security: {Title}"
        ],
        introVariations: [
            "Security updates and conflict reporting for {Title}. Objective analysis of volatile situations.",
            "Tracking developments in the {Title} conflict. Daily reports and tactical analysis."
        ],
        faqTemplates: [
            { q: "What is the current status of the {Title} conflict?", a: "Our situation report provides daily updates on front lines, diplomatic efforts, and security assessments." }
        ]
    },
    regulation: {
        titleVariations: [
            "{Title} Regulation & Policy News",
            "{Title} Compliance: New Rules & Laws",
            "Governing {Title}: Legal & Policy Updates",
            "{Title} Law Watch: Regulatory Changes"
        ],
        descriptionVariations: [
            "Tracking {Title} regulations. New laws, policy debates, and compliance updates.",
            "How {Title} is being regulated. Analysis of new bills, enforcement actions, and global standards.",
            "Navigating {Title} compliance. Essential news for businesses and policymakers."
        ],
        h1Variations: [
            "{Title} Policy Tracker",
            "Regulating {Title}",
            "{Title} Compliance",
            "{Title} Law Monitor"
        ],
        introVariations: [
            "Tracking regulations and policy changes in {Title}. Helping you stay compliant and informed.",
            "Deep analysis of the legal framework surrounding {Title}."
        ],
        faqTemplates: [
            { q: "Are there new regulations for {Title}?", a: "We monitor legislative bodies globally to alert you to new laws and compliance requirements for {Title}." }
        ]
    },
    keywords: {
        titleVariations: [
            "{Title} News | Analysis & Updates",
            "Understanding {Title}: Trends & Reports",
            "{Title} Watch: Latest Developments",
            "The State of {Title}: News Briefing"
        ],
        descriptionVariations: [
            "Latest news regarding {Title}. In-depth analysis and real-time updates.",
            "Track the impact of {Title}. Economic reports, social trends, and expert commentary.",
            "Comprehensive guide to {Title}. What it means and how it affects you."
        ],
        h1Variations: [
            "{Title}",
            "{Title} Trends",
            "{Title} Analysis",
            "Focus: {Title}"
        ],
        introVariations: [
            "Analysis and updates on {Title}. Making sense of complex topics.",
            "Your guide to {Title}. Breaking down the news and the noise."
        ],
        faqTemplates: [
            { q: "Why is {Title} important right now?", a: "{Title} is a key driver of current events. Our analysis helps explain its significance and impact." }
        ]
    },
    news: {
        titleVariations: [
            "Latest {Title} Articles",
            "{Title} Headlines",
            "{Title} News Feed",
            "Read About {Title}"
        ],
        descriptionVariations: [
            "Read the latest articles about {Title}.",
            "Top stories featuring {Title}.",
            "aggregated news for {Title}."
        ],
        h1Variations: [
            "{Title} Articles",
            "{Title} Reader",
            "News: {Title}",
            "Stories on {Title}"
        ],
        introVariations: [
            "Latest articles.",
            "Recent stories."
        ],
        faqTemplates: []
    }
};

export const SEO_DATA_URL = 'https://cdn.jsdelivr.net/gh/xupgudxup/BUg-7d8-diua-sdadh89-@main/output';

// Dynamic Text Generator
const FAQ_POOLS: Record<string, { qV: string[], aV: string[] }[]> = {
    general: [
        {
            qV: ["What is the latest news about {Title}?", "What is happening with {Title} today?", "Where can I find breaking news on {Title}?"],
            aV: ["Our feed aggregates real-time updates from verified sources to keep you informed about {Title}.", "Stay current with the latest headlines and developments involving {Title} on our live tracker.", "We monitor thousands of trusted outlets to bring you comprehensive coverage of {Title}."]
        },
        {
            qV: ["Why is {Title} trending right now?", "What are the key discussions around {Title}?", "Why is everyone talking about {Title}?"],
            aV: ["{Title} is currently driving conversations due to recent events and high media interest.", "The latest reports highlight significant developments in {Title}, sparking widespread discussion.", "Breaking news and emerging trends have spotlighted {Title} in today's news cycle."]
        },
        {
            qV: ["How can I follow updates for {Title}?", "What is the best way to track {Title} news?", "Is there a live feed for {Title}?"],
            aV: ["You can follow our dedicated {Title} feed which is updated 24/7 with the latest stories.", "Bookmark this page for instant access to curated news, analysis, and reports on {Title}.", "Yes, our real-time dashboard provides immediate updates and diverse perspectives on {Title}."]
        }
    ],
    // Add specific pools for high-value categories
    location: [
        {
            qV: ["What are the top stories in {Title} today?", "What is happening locally in {Title}?", "What are the latest events in {Title}?"],
            aV: ["Top stories include breaking local news, weather updates, and community events shaping {Title} today.", "Current reports focus on local politics, development projects, and cultural happenings in {Title}.", "The latest updates cover everything from municipal announcements to local business news in {Title}."]
        },
        {
            qV: ["Is there any breaking news in {Title}?", "Are there traffic or safety alerts for {Title}?", "What should residents of {Title} know right now?"],
            aV: ["Our system tracks emergency broadcasts and breaking news alerts for {Title} in real-time.", "We provide immediate updates on traffic, safety, and urgent community alerts for {Title} residents.", "Stay alert with our live feed covering critical updates and safety information for the {Title} area."]
        }
    ],
    people: [
        {
            qV: ["What did {Title} say recently?", "What is {Title}'s latest statement?", "Has {Title} responded to the recent news?"],
            aV: ["Recent reports highlight the latest public statements and interviews given by {Title}.", "{Title} has addressed current topics in recent appearances, as detailed in our latest articles.", "Follow our timeline of accurate quotes and official responses from {Title}."]
        },
        {
            qV: ["What is {Title} working on now?", "What are {Title}'s upcoming projects?", "What is next for {Title}?"],
            aV: ["Media reports suggest {Title} is currently focused on new initiatives and upcoming public engagements.", "{Title} is making headlines with new projects and strategic moves in the industry.", "Analysts are closely watching {Title}'s next steps following recent announcements."]
        }
    ],
    business: [ // Industry, Company, Product
        {
            qV: ["How is {Title} performing in the market?", "What is the market outlook for {Title}?", "Is {Title} growing?"],
            aV: ["Market analysis indicates significant activity around {Title}, with experts weighing in on future trends.", "Recent data shows dynamic shifts in the {Title} sector, influencing market performance.", "Investors and analysts are tracking {Title} closely amidst evolving market conditions."]
        },
        {
            qV: ["What are the latest innovations in {Title}?", "Are there new products related to {Title}?", "How is technology changing {Title}?"],
            aV: ["Innovation is driving change in {Title}, with new technologies reshaping the landscape.", "Recent launches and tech advancements are setting new standards in the world of {Title}.", "The {Title} sector is seeing rapid evolution driven by technological breakthroughs."]
        }
    ]
};

function getFaqPool(category: string) {
    if (['location'].includes(category)) return [...FAQ_POOLS.general, ...FAQ_POOLS.location];
    if (['people', 'team'].includes(category)) return [...FAQ_POOLS.general, ...FAQ_POOLS.people];
    if (['industry', 'company', 'product', 'marketing'].includes(category)) return [...FAQ_POOLS.general, ...FAQ_POOLS.business];
    return FAQ_POOLS.general;
}

// Pseudo-random number generator seeded by string
function sfc32(a: number, b: number, c: number, d: number) {
    return function () {
        a >>>= 0; b >>>= 0; c >>>= 0; d >>>= 0;
        var t = (a + b) | 0;
        a = b ^ b >>> 9;
        b = c + (c << 3) | 0;
        c = (c << 21) | (c >>> 11);
        d = (d + 1) | 0;
        t = (t + d) | 0;
        c = (c + t) | 0;
        return (t >>> 0) / 4294967296;
    }
}

export function getSeoMetadata(category: CategoryId, slug: string) {
    const config = SEO_CONFIG[category] || SEO_CONFIG.keywords;
    const keywordDef = getKeywordFromSlug(category, slug);

    // Use rich title if available, otherwise fallback to formatted slug
    const richTitle = keywordDef ? keywordDef.title : slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const aliases = keywordDef && keywordDef.aliases.length > 0 ? keywordDef.aliases.slice(0, 3).join(', ') : richTitle;

    // Pick consistent variations
    const titleTemplate = pickVariation(slug, config.titleVariations);
    const descTemplate = pickVariation(slug, config.descriptionVariations);
    const h1Template = pickVariation(slug, config.h1Variations);
    const introTemplate = pickVariation(slug, config.introVariations);

    // FAQ Logic
    // seeder
    let seed = 0;
    for (let i = 0; i < slug.length; i++) seed += slug.charCodeAt(i);
    const rand = sfc32(seed, seed ^ 0xDEADBEEF, seed ^ 0xCAFEBABE, seed ^ 0xFACEFEED);

    // Get relevant pool
    const pool = getFaqPool(category);

    // Shuffle and pick 3
    const shuffledPool = [...pool].sort(() => rand() - 0.5);
    const selectedFaqs = shuffledPool.slice(0, 3).map(item => {
        const qTemplate = item.qV[Math.floor(rand() * item.qV.length)];
        const aTemplate = item.aV[Math.floor(rand() * item.aV.length)];
        return {
            q: qTemplate.replace(/{Title}/g, richTitle),
            a: aTemplate.replace(/{Title}/g, richTitle)
        };
    });

    return {
        title: titleTemplate.replace(/{Title}/g, richTitle).replace(/{Aliases}/g, aliases),
        description: descTemplate.replace(/{Title}/g, richTitle).replace(/{Aliases}/g, aliases),
        h1: h1Template.replace(/{Title}/g, richTitle),
        intro: introTemplate.replace(/{Title}/g, richTitle),
        faqs: selectedFaqs,
        richTitle,
        aliases: keywordDef?.aliases || []
    };
}
