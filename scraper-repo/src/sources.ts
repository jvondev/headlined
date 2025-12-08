// RSS Sources Configuration
// Note: max_items is now optional (used only for safety limits)
// The scraper dynamically filters by date (today + yesterday)

export interface Source {
    name: string;
    url: string;
    topic: string;
}

export const sourcesData: Source[] = [
    {
        "name": "Yahoo News",
        "url": "https://news.yahoo.com/rss/",
        "topic": "news",
    },
    {
        "name": "Hacker News",
        "url": "https://hnrss.org/newest.atom",
        "topic": "tech",
    },
    {
        "name": "Slashdot",
        "url": "https://rss.slashdot.org/Slashdot/slashdot",
        "topic": "news",
    },
    {
        "name": "Bloomberg Markets",
        "url": "https://feeds.bloomberg.com/markets/news.rss",
        "topic": "finance",
    },
    {
        "name": "MarketWatch Top Stories",
        "url": "https://feeds.content.dowjones.io/public/rss/mw_topstories",
        "topic": "finance",
    },
    {
        "name": "Investing.com News",
        "url": "https://www.investing.com/rss/news.rss",
        "topic": "finance",
    },
    {
        "name": "HNRSS Jobs",
        "url": "https://hnrss.org/jobs.atom",
        "topic": "jobs",
    },
    {
        "name": "The Guardian Tech",
        "url": "https://www.theguardian.com/uk/technology/rss",
        "topic": "tech",
    },
    {
        "name": "Washington Post World",
        "url": "https://feeds.washingtonpost.com/rss/world",
        "topic": "news",
    },
    {
        "name": "Yahoo Sports",
        "url": "https://sports.yahoo.com/rss/",
        "topic": "sports",
    },
    {
        "name": "BBC Sport",
        "url": "https://feeds.bbci.co.uk/sport/rss.xml",
        "topic": "sports",
    },
    {
        "name": "Lifehacker",
        "url": "https://lifehacker.com/feed/rss",
        "topic": "tech",
    },
    {
        "name": "Harvard Business Review",
        "url": "http://feeds.harvardbusiness.org/harvardbusiness/",
        "topic": "business",
    },
    {
        "name": "Business Insider",
        "url": "https://feeds2.feedburner.com/businessinsider",
        "topic": "finance",
    },
    {
        "name": "Fortune",
        "url": "http://fortune.com/feed/fortune-feeds/?id=3230629",
        "topic": "business",
    },
    {
        "name": "The Nation",
        "url": "https://www.thenation.com/feed/?post_type=article",
        "topic": "politic",
    },
    {
        "name": "GameSpot",
        "url": "https://www.gamespot.com/feeds/mashup/",
        "topic": "gaming",
    }
];
