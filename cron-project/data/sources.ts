export const sourcesData = [
    {
        "name": "Yahoo News",
        "url": "https://news.yahoo.com/rss/",
        "topic": "news",
        "max_items": 60,
    },
    {
        "name": "Hacker News",
        "url": "https://hnrss.org/frontpage.atom",
        "topic": "tech",
        "max_items": 60,
    },
    {
        "name": "Slashdot",
        "url": "https://rss.slashdot.org/Slashdot/slashdot",
        "topic": "news", // Will be set dynamically based on subdomain
        "max_items": 60,
    },
    {
        "name": "Bloomberg Markets",
        "url": "https://feeds.bloomberg.com/markets/news.rss",
        "topic": "finance",
        "max_items": 30,
    },
    {
        "name": "MarketWatch Top Stories",
        "url": "https://feeds.content.dowjones.io/public/rss/mw_topstories",
        "topic": "finance",
        "max_items": 30,
    },
    {
        "name": "Investing.com News",
        "url": "https://www.investing.com/rss/news.rss",
        "topic": "finance",
        "max_items": 30,
    }
];