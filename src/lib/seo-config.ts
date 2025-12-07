export type CategoryId =
    | 'location' | 'people' | 'media' | 'team' | 'topics'
    | 'industry' | 'interest' | 'company' | 'event' | 'product'
    | 'legal' | 'demographic' | 'government' | 'weather'
    | 'education' | 'science' | 'conflict' | 'regulation' | 'keywords' | 'news';

export const SEO_CONFIG: Record<CategoryId, {
    titleTemplate: string;
    descriptionTemplate: string;
    h1Template: string;
    introTemplate: string;
}> = {
    location: {
        titleTemplate: "Latest News in {Slug} | Local Updates & Real-time Coverage",
        descriptionTemplate: "Stay informed with the latest breaking news, events, and developments in {Slug}. Comprehensive coverage including local politics, economy, and community updates.",
        h1Template: "{Slug} News",
        introTemplate: "Explore the latest happenings in {Slug}. This feed tracks real-time updates from verified local and international sources to keep you informed about what matters in {Slug}."
    },
    people: {
        titleTemplate: "{Slug} News Tracker | Recent Events & Updates",
        descriptionTemplate: "Track the latest news and updates regarding {Slug}. Timelines, statements, and analysis from top media sources aggregating real-time coverage.",
        h1Template: "{Slug}: Latest Updates",
        introTemplate: "Follow the latest developments regarding {Slug}. Our tracker aggregates news, statements, and analysis to provide a complete picture of recent events."
    },
    media: {
        titleTemplate: "{Slug} Coverage & Media Updates",
        descriptionTemplate: "Recent stories and reports from {Slug}. Analysis of media coverage, press releases, and major headlines involving {Slug}.",
        h1Template: "{Slug} Media Watch",
        introTemplate: "Latest reports and headlines involving {Slug}."
    },
    team: {
        titleTemplate: "{Slug} Team News, Scores & Roster Updates",
        descriptionTemplate: "Get the latest {Slug} news, game results, trade rumors, and injury reports. Comprehensive coverage for fans.",
        h1Template: "{Slug} News & Updates",
        introTemplate: "All the latest news, scores, and updates for the {Slug}."
    },
    topics: {
        titleTemplate: "Latest {Slug} News & Trends",
        descriptionTemplate: "Deep dive into {Slug}. Trends, analysis, and breaking stories shaping the world of {Slug}.",
        h1Template: "{Slug}",
        introTemplate: "Latest trends and analysis in {Slug}."
    },
    industry: {
        titleTemplate: "{Slug} Industry News & Market Analysis",
        descriptionTemplate: "Professional coverage of the {Slug} industry. Market trends, corporate moves, and economic analysis.",
        h1Template: "{Slug} Industry Insights",
        introTemplate: "Market analysis and corporate news for the {Slug} sector."
    },
    interest: {
        titleTemplate: "{Slug} guide: News, Tips & Trends",
        descriptionTemplate: "Discover the latest in {Slug}. News, guides, and trends for enthusiasts.",
        h1Template: "{Slug}",
        introTemplate: "Updates and trends for {Slug} enthusiasts."
    },
    company: {
        titleTemplate: "{Slug} Company News | Stock, Products & Press",
        descriptionTemplate: "Latest news about {Slug}. Stock market performance, product announcements, and corporate updates.",
        h1Template: "{Slug} Corporate News",
        introTemplate: "Latest announcements and market moves from {Slug}."
    },
    event: {
        titleTemplate: "{Slug} Live Updates & News Coverage",
        descriptionTemplate: "Follow {Slug} live. Real-time updates, results, and comprehensive news coverage of the event.",
        h1Template: "{Slug} Live Coverage",
        introTemplate: "Real-time updates and news for {Slug}."
    },
    product: {
        titleTemplate: "{Slug} News, Reviews & Release Dates",
        descriptionTemplate: "Everything about {Slug}. Latest rumors, release dates, reviews, and feature updates.",
        h1Template: "{Slug} Updates",
        introTemplate: "News, reviews, and updates for {Slug}."
    },
    legal: {
        titleTemplate: "{Slug} Legal News & Court Updates",
        descriptionTemplate: "Latest legal developments regarding {Slug}. Court rulings, lawsuits, and regulatory updates.",
        h1Template: "{Slug} Legal Monitor",
        introTemplate: "Tracking legal developments and court rulings related to {Slug}."
    },
    demographic: {
        titleTemplate: "News & Resources for {Slug}",
        descriptionTemplate: "Curated news and resources relevant to {Slug}. Trends, policy changes, and opportunities.",
        h1Template: "{Slug} Insights",
        introTemplate: "News and resources tailored for {Slug}."
    },
    government: {
        titleTemplate: "{Slug} News & Official Announcements",
        descriptionTemplate: "Latest updates from {Slug}. Policy announcements, press releases, and official statements.",
        h1Template: "{Slug} Briefing",
        introTemplate: "Official news and policy updates from {Slug}."
    },
    weather: {
        titleTemplate: "{Slug} Alert: News, Forecast & Impact",
        descriptionTemplate: "Urgent {Slug} updates. Forecasts, safety warnings, and impact reports.",
        h1Template: "{Slug} Watch",
        introTemplate: "Forecasts and safety updates for {Slug}."
    },
    education: {
        titleTemplate: "{Slug} News & Academic Updates",
        descriptionTemplate: "Latest news from {Slug}. Research, admissions, and campus updates.",
        h1Template: "{Slug} News",
        introTemplate: "Academic and campus updates from {Slug}."
    },
    science: {
        titleTemplate: "{Slug} Research & Scientific Breakthroughs",
        descriptionTemplate: "Latest discoveries in {Slug}. Research papers, scientific breakthroughs, and expert analysis.",
        h1Template: "{Slug} Research",
        introTemplate: "Scientific breakthroughs and research in {Slug}."
    },
    conflict: {
        titleTemplate: "{Slug} Conflict News & Security Updates",
        descriptionTemplate: "Monitoring {Slug}. Security assessments, live conflict reporting, and geopolitical analysis.",
        h1Template: "{Slug} Monitor",
        introTemplate: "Security updates and conflict reporting for {Slug}."
    },
    regulation: {
        titleTemplate: "{Slug} Regulation & Policy News",
        descriptionTemplate: "Tracking {Slug} regulations. New laws, policy debates, and compliance updates.",
        h1Template: "{Slug} Policy Tracker",
        introTemplate: "Tracking regulations and policy changes in {Slug}."
    },
    keywords: {
        titleTemplate: "{Slug} News | Analysis & Updates",
        descriptionTemplate: "Latest news regarding {Slug}. In-depth analysis and real-time updates.",
        h1Template: "{Slug}",
        introTemplate: "Analysis and updates on {Slug}."
    },
    news: {
        titleTemplate: "Latest {Slug} Articles",
        descriptionTemplate: "Read the latest articles about {Slug}.",
        h1Template: "{Slug} Articles",
        introTemplate: "Latest articles."
    }
};

export const SEO_DATA_URL = 'https://cdn.jsdelivr.net/gh/xupgudxup/BUg-7d8-diua-sdadh89-@main/output';
