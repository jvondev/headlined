export interface SeoKeywordDef {
    slug: string; // The URL-friendly version (e.g., 'ai')
    title: string; // The rich display title (e.g., 'Artificial Intelligence')
    aliases: string[]; // Variations for scraper matching (e.g., 'LLM', 'GPT')
    wikidata?: string; // Wikidata entity ID for Entity Salience (e.g., 'Q11660' for AI)
}

export type CategoryId =
    | 'location' | 'people' | 'media' | 'team' | 'topics'
    | 'industry' | 'interest' | 'company' | 'event' | 'product'
    | 'legal' | 'demographic' | 'government' | 'weather'
    | 'education' | 'science' | 'conflict' | 'regulation' | 'keywords' | 'news';

export const SEO_CATEGORIES: Record<CategoryId, SeoKeywordDef[]> = {
    location: [
        { slug: 'san-diego', title: 'San Diego', aliases: ['San Diego', 'SD'] },
        { slug: 'florida', title: 'Florida', aliases: ['Florida', 'FL'] },
        { slug: 'new-york', title: 'New York', aliases: ['New York', 'NYC', 'NY', 'Manhattan'] },
        { slug: 'london', title: 'London', aliases: ['London', 'UK Capital'] },
        { slug: 'paris', title: 'Paris', aliases: ['Paris'] },
        { slug: 'tokyo', title: 'Tokyo', aliases: ['Tokyo'] },
        { slug: 'california', title: 'California', aliases: ['California', 'CA', 'Cali'] },
        { slug: 'texas', title: 'Texas', aliases: ['Texas', 'TX'] },
        { slug: 'india', title: 'India', aliases: ['India', 'Bharat'] },
        { slug: 'china', title: 'China', aliases: ['China', 'PRC'] },
        { slug: 'russia', title: 'Russia', aliases: ['Russia'] },
        { slug: 'ukraine', title: 'Ukraine', aliases: ['Ukraine'] },
        { slug: 'israel', title: 'Israel', aliases: ['Israel'] },
        { slug: 'gaza', title: 'Gaza', aliases: ['Gaza', 'Gaza Strip'] },
        { slug: 'washington', title: 'Washington', aliases: ['Washington', 'DC', 'Washington DC'] },
        { slug: 'beijing', title: 'Beijing', aliases: ['Beijing'] },
        { slug: 'moscow', title: 'Moscow', aliases: ['Moscow'] },
        { slug: 'kyiv', title: 'Kyiv', aliases: ['Kyiv', 'Kiev'] },
        { slug: 'brussels', title: 'Brussels', aliases: ['Brussels'] },
        { slug: 'ottawa', title: 'Ottawa', aliases: ['Ottawa'] }
    ],
    people: [
        { slug: 'trump', title: 'Donald Trump', aliases: ['Trump', 'Donald Trump', 'DJT'], wikidata: 'Q22686' },
        { slug: 'biden', title: 'Joe Biden', aliases: ['Biden', 'Joe Biden', 'POTUS'], wikidata: 'Q6279' },
        { slug: 'musk', title: 'Elon Musk', aliases: ['Musk', 'Elon Musk'], wikidata: 'Q317521' },
        { slug: 'zuckerberg', title: 'Mark Zuckerberg', aliases: ['Zuckerberg', 'Mark Zuckerberg', 'Zuck'], wikidata: 'Q36215' },
        { slug: 'putin', title: 'Vladimir Putin', aliases: ['Putin', 'Vladimir Putin'], wikidata: 'Q7747' },
        { slug: 'zelenskyy', title: 'Volodymyr Zelenskyy', aliases: ['Zelenskyy', 'Zelensky'], wikidata: 'Q3570727' },
        { slug: 'xi-jinping', title: 'Xi Jinping', aliases: ['Xi Jinping', 'President Xi'], wikidata: 'Q15031' },
        { slug: 'modi', title: 'Narendra Modi', aliases: ['Modi', 'Narendra Modi'], wikidata: 'Q1058' },
        { slug: 'netanyahu', title: 'Benjamin Netanyahu', aliases: ['Netanyahu', 'Bibi'], wikidata: 'Q160973' },
        { slug: 'macron', title: 'Emmanuel Macron', aliases: ['Macron', 'Emmanuel Macron'], wikidata: 'Q3052772' },
        { slug: 'sunak', title: 'Rishi Sunak', aliases: ['Sunak', 'Rishi Sunak'], wikidata: 'Q7306714' },
        { slug: 'scholz', title: 'Olaf Scholz', aliases: ['Scholz', 'Olaf Scholz'], wikidata: 'Q61044' }
    ],
    media: [
        { slug: 'bbc', title: 'BBC', aliases: ['BBC', 'British Broadcasting Corporation'] },
        { slug: 'cnn', title: 'CNN', aliases: ['CNN'] },
        { slug: 'fox-news', title: 'Fox News', aliases: ['Fox News'] },
        { slug: 'wwe', title: 'WWE', aliases: ['WWE', 'World Wrestling Entertainment'] },
        { slug: 'disney', title: 'Disney', aliases: ['Disney'] },
        { slug: 'netflix', title: 'Netflix', aliases: ['Netflix'] },
        { slug: 'warner-bros', title: 'Warner Bros', aliases: ['Warner Bros', 'WB'] },
        { slug: 'paramount', title: 'Paramount', aliases: ['Paramount'] },
        { slug: 'sony-pictures', title: 'Sony Pictures', aliases: ['Sony Pictures'] }
    ],
    team: [
        { slug: 'nfl', title: 'NFL', aliases: ['NFL', 'National Football League'] },
        { slug: 'nba', title: 'NBA', aliases: ['NBA', 'National Basketball Association'] },
        { slug: 'mlb', title: 'MLB', aliases: ['MLB', 'Major League Baseball'] },
        { slug: 'nhl', title: 'NHL', aliases: ['NHL', 'National Hockey League'] },
        { slug: 'premier-league', title: 'Premier League', aliases: ['Premier League', 'EPL'] },
        { slug: 'lakers', title: 'Lakers', aliases: ['Lakers', 'LA Lakers'] },
        { slug: 'warriors', title: 'Warriors', aliases: ['Warriors', 'Golden State Warriors'] },
        { slug: 'yankees', title: 'Yankees', aliases: ['Yankees', 'NY Yankees'] },
        { slug: 'dodgers', title: 'Dodgers', aliases: ['Dodgers', 'LA Dodgers'] },
        { slug: 'cowboys', title: 'Cowboys', aliases: ['Cowboys', 'Dallas Cowboys'] },
        { slug: 'chiefs', title: 'Chiefs', aliases: ['Chiefs', 'Kansas City Chiefs'] }
    ],
    topics: [
        { slug: 'tech', title: 'Technology', aliases: ['Tech', 'Technology'] },
        { slug: 'business', title: 'Business', aliases: ['Business', 'Corporate'] },
        { slug: 'economy', title: 'Economy', aliases: ['Economy', 'Economics'] },
        { slug: 'politics', title: 'Politics', aliases: ['Politics', 'Political'] },
        { slug: 'health', title: 'Health', aliases: ['Health', 'Wellness'] },
        { slug: 'entertainment', title: 'Entertainment', aliases: ['Entertainment', 'Showbiz'] },
        { slug: 'sports', title: 'Sports', aliases: ['Sports'] },
        { slug: 'science', title: 'Science', aliases: ['Science'] },
        { slug: 'world', title: 'World News', aliases: ['World', 'International', 'Global'] }
    ],
    industry: [
        { slug: 'real-estate', title: 'Real Estate', aliases: ['Real Estate', 'Housing Market'] },
        { slug: 'energy', title: 'Energy', aliases: ['Energy', 'Oil', 'Gas', 'Renewables'] },
        { slug: 'automotive', title: 'Automotive', aliases: ['Automotive', 'Auto Industry', 'Cars'] },
        { slug: 'banking', title: 'Banking', aliases: ['Banking', 'Banks', 'Wall Street'] },
        { slug: 'retail', title: 'Retail', aliases: ['Retail', 'Consumer Goods'] },
        { slug: 'healthcare', title: 'Healthcare', aliases: ['Healthcare', 'Hospitals'] },
        { slug: 'construction', title: 'Construction', aliases: ['Construction'] },
        { slug: 'manufacturing', title: 'Manufacturing', aliases: ['Manufacturing', 'Factory'] },
        { slug: 'technology', title: 'Technology Sector', aliases: ['Technology', 'Tech Sector', 'SaaS'] }
    ],
    interest: [
        { slug: 'ai', title: 'Artificial Intelligence', aliases: ['AI', 'Artificial Intelligence', 'Machine Learning', 'LLM', 'Generative AI', 'ChatGPT', 'OpenAI', 'Anthropic'], wikidata: 'Q11660' },
        { slug: 'crypto', title: 'Cryptocurrency', aliases: ['Crypto', 'Cryptocurrency', 'Bitcoin', 'Ethereum', 'Blockchain', 'Web3'], wikidata: 'Q13479982' },
        { slug: 'gaming', title: 'Gaming', aliases: ['Gaming', 'Video Games', 'Esports'], wikidata: 'Q7889' },
        { slug: 'fitness', title: 'Fitness', aliases: ['Fitness', 'Workout', 'Gym'] },
        { slug: 'travel', title: 'Travel', aliases: ['Travel', 'Tourism', 'Vacation'] },
        { slug: 'cooking', title: 'Cooking', aliases: ['Cooking', 'Recipes', 'Food'] },
        { slug: 'fashion', title: 'Fashion', aliases: ['Fashion', 'Style', 'Apparel'] },
        { slug: 'photography', title: 'Photography', aliases: ['Photography', 'Cameras'] },
        { slug: 'writing', title: 'Writing', aliases: ['Writing', 'Authors'] },
        { slug: 'coding', title: 'Programming', aliases: ['Coding', 'Programming', 'Software Development', 'Web Development'] }
    ],
    company: [
        { slug: 'apple', title: 'Apple', aliases: ['Apple', 'AAPL', 'iPhone Maker'], wikidata: 'Q312' },
        { slug: 'google', title: 'Google', aliases: ['Google', 'Alphabet', 'GOOGL'], wikidata: 'Q95' },
        { slug: 'microsoft', title: 'Microsoft', aliases: ['Microsoft', 'MSFT', 'Windows Maker'], wikidata: 'Q2283' },
        { slug: 'amazon', title: 'Amazon', aliases: ['Amazon', 'AMZN', 'AWS'], wikidata: 'Q3884' },
        { slug: 'meta', title: 'Meta', aliases: ['Meta', 'Facebook', 'Instagram', 'META'], wikidata: 'Q380' },
        { slug: 'tesla', title: 'Tesla', aliases: ['Tesla', 'TSLA'], wikidata: 'Q478214' },
        { slug: 'nvidia', title: 'Nvidia', aliases: ['Nvidia', 'NVDA', 'GPU Maker'], wikidata: 'Q182477' },
        { slug: 'samsung', title: 'Samsung', aliases: ['Samsung'], wikidata: 'Q20718' },
        { slug: 'toyota', title: 'Toyota', aliases: ['Toyota'], wikidata: 'Q53268' },
        { slug: 'volkswagen', title: 'Volkswagen', aliases: ['Volkswagen', 'VW'], wikidata: 'Q246' }
    ],
    event: [
        { slug: 'election', title: 'Election', aliases: ['Election', 'Vote', 'Polls'] },
        { slug: 'olympics', title: 'Olympics', aliases: ['Olympics', 'Olympic Games'] },
        { slug: 'world-cup', title: 'World Cup', aliases: ['World Cup', 'FIFA World Cup'] },
        { slug: 'super-bowl', title: 'Super Bowl', aliases: ['Super Bowl'] },
        { slug: 'eurovision', title: 'Eurovision', aliases: ['Eurovision'] },
        { slug: 'oscars', title: 'Oscars', aliases: ['Oscars', 'Academy Awards'] },
        { slug: 'grammys', title: 'Grammys', aliases: ['Grammys'] },
        { slug: 'ces', title: 'CES', aliases: ['CES', 'Consumer Electronics Show'] },
        { slug: 'wwdc', title: 'WWDC', aliases: ['WWDC', 'Apple Event'] }
    ],
    product: [
        { slug: 'iphone', title: 'iPhone', aliases: ['iPhone', 'iOS'] },
        { slug: 'ipad', title: 'iPad', aliases: ['iPad'] },
        { slug: 'macbook', title: 'MacBook', aliases: ['MacBook', 'MacBook Pro', 'MacBook Air'] },
        { slug: 'chatgpt', title: 'ChatGPT', aliases: ['ChatGPT', 'GPT-4', 'GPT-5'] },
        { slug: 'pixel', title: 'Pixel', aliases: ['Pixel', 'Google Pixel'] },
        { slug: 'galaxy', title: 'Galaxy', aliases: ['Galaxy', 'Samsung Galaxy'] },
        { slug: 'xbox', title: 'Xbox', aliases: ['Xbox', 'Series X'] },
        { slug: 'playstation', title: 'PlayStation', aliases: ['PlayStation', 'PS5'] },
        { slug: 'windows', title: 'Windows', aliases: ['Windows', 'Windows 11'] },
        { slug: 'vision-pro', title: 'Vision Pro', aliases: ['Vision Pro', 'Apple Vision'] }
    ],
    legal: [
        { slug: 'supreme-court', title: 'Supreme Court', aliases: ['Supreme Court', 'SCOTUS'] },
        { slug: 'federal-court', title: 'Federal Court', aliases: ['Federal Court'] },
        { slug: 'lawsuit', title: 'Lawsuit', aliases: ['Lawsuit', 'Sued', 'Litigation'] },
        { slug: 'crime', title: 'Crime', aliases: ['Crime', 'Criminal'] },
        { slug: 'regulation', title: 'Regulation', aliases: ['Regulation', 'Regulators'] },
        { slug: 'doj', title: 'Department of Justice', aliases: ['DoJ', 'Department of Justice'] },
        { slug: 'judge', title: 'Judge', aliases: ['Judge', 'Ruling'] },
        { slug: 'verdict', title: 'Verdict', aliases: ['Verdict', 'Sentencing'] },
        { slug: 'indictment', title: 'Indictment', aliases: ['Indictment'] }
    ],
    demographic: [
        { slug: 'student', title: 'Students', aliases: ['Student', 'Undergraduate', 'Graduate'] },
        { slug: 'veteran', title: 'Veterans', aliases: ['Veteran', 'Vets'] },
        { slug: 'small-business', title: 'Small Business', aliases: ['Small Business', 'SMB', 'Entrepreneur'] },
        { slug: 'investor', title: 'Investors', aliases: ['Investor', 'Shareholder'] },
        { slug: 'founder', title: 'Founders', aliases: ['Founder', 'Startup Founder'] },
        { slug: 'millennial', title: 'Millennials', aliases: ['Millennial', 'Gen Y'] },
        { slug: 'gen-z', title: 'Gen Z', aliases: ['Gen Z', 'Zoomer'] },
        { slug: 'retiree', title: 'Retirees', aliases: ['Retiree', 'Pensioner'] }
    ],
    government: [
        { slug: 'fbi', title: 'FBI', aliases: ['FBI', 'Federal Bureau of Investigation'] },
        { slug: 'cia', title: 'CIA', aliases: ['CIA'] },
        { slug: 'pentagon', title: 'Pentagon', aliases: ['Pentagon', 'DoD'] },
        { slug: 'sec', title: 'SEC', aliases: ['SEC', 'Securities and Exchange Commission'] },
        { slug: 'irs', title: 'IRS', aliases: ['IRS'] },
        { slug: 'fda', title: 'FDA', aliases: ['FDA'] },
        { slug: 'epa', title: 'EPA', aliases: ['EPA'] },
        { slug: 'nasa', title: 'NASA', aliases: ['NASA'] },
        { slug: 'dhs', title: 'DHS', aliases: ['DHS', 'Homeland Security'] },
        { slug: 'state-department', title: 'State Department', aliases: ['State Department'] }
    ],
    weather: [
        { slug: 'hurricane', title: 'Hurricane', aliases: ['Hurricane', 'Typhoon', 'Cyclone'] },
        { slug: 'earthquake', title: 'Earthquake', aliases: ['Earthquake', 'Quake'] },
        { slug: 'tornado', title: 'Tornado', aliases: ['Tornado'] },
        { slug: 'flood', title: 'Flooding', aliases: ['Flood', 'Flooding'] },
        { slug: 'wildfire', title: 'Wildfire', aliases: ['Wildfire', 'Forest Fire'] },
        { slug: 'tsunami', title: 'Tsunami', aliases: ['Tsunami'] },
        { slug: 'climate-change', title: 'Climate Change', aliases: ['Climate Change', 'Global Warming'] },
        { slug: 'heatwave', title: 'Heatwave', aliases: ['Heatwave'] },
        { slug: 'storm', title: 'Storm', aliases: ['Storm', 'Blizzard'] }
    ],
    education: [
        { slug: 'harvard', title: 'Harvard', aliases: ['Harvard'] },
        { slug: 'yale', title: 'Yale', aliases: ['Yale'] },
        { slug: 'university', title: 'University', aliases: ['University', 'Campus'] },
        { slug: 'college', title: 'College', aliases: ['College'] },
        { slug: 'school-district', title: 'School Districts', aliases: ['School District'] },
        { slug: 'admissions', title: 'Admissions', aliases: ['Admissions', 'College App'] },
        { slug: 'student-debt', title: 'Student Debt', aliases: ['Student Debt', 'Student Loans'] },
        { slug: 'tuition', title: 'Tuition', aliases: ['Tuition'] }
    ],
    science: [
        { slug: 'space', title: 'Space Exploration', aliases: ['Space', 'Outer Space'] },
        { slug: 'nasa', title: 'NASA', aliases: ['NASA'] },
        { slug: 'physics', title: 'Physics', aliases: ['Physics', 'Quantum Physics'] },
        { slug: 'biology', title: 'Biology', aliases: ['Biology'] },
        { slug: 'chemistry', title: 'Chemistry', aliases: ['Chemistry'] },
        { slug: 'astronomy', title: 'Astronomy', aliases: ['Astronomy'] },
        { slug: 'medical-research', title: 'Medical Research', aliases: ['Medical Research', 'Clinical Trial'] },
        { slug: 'quantum', title: 'Quantum Computing', aliases: ['Quantum', 'Quantum Computer'] },
        { slug: 'fusion', title: 'Nuclear Fusion', aliases: ['Fusion', 'Nuclear Energy'] }
    ],
    conflict: [
        { slug: 'war', title: 'War', aliases: ['War', 'Conflict'] },
        { slug: 'military', title: 'Military', aliases: ['Military', 'Armed Forces'] },
        { slug: 'terrorism', title: 'Terrorism', aliases: ['Terrorism', 'Terrorist'] },
        { slug: 'cyberattack', title: 'Cyberattack', aliases: ['Cyberattack', 'Hacking', 'Data Breach'] },
        { slug: 'national-security', title: 'National Security', aliases: ['National Security'] },
        { slug: 'defense', title: 'Defense', aliases: ['Defense', 'Defense Industry'] },
        { slug: 'army', title: 'Army', aliases: ['Army'] },
        { slug: 'navy', title: 'Navy', aliases: ['Navy'] },
        { slug: 'air-force', title: 'Air Force', aliases: ['Air Force'] }
    ],
    regulation: [
        { slug: 'tax-law', title: 'Tax Law', aliases: ['Tax Law', 'Tax Legislation'] },
        { slug: 'immigration-policy', title: 'Immigration Policy', aliases: ['Immigration Policy', 'Border Policy'] },
        { slug: 'ai-regulation', title: 'AI Regulation', aliases: ['AI Regulation', 'AI Safety'] },
        { slug: 'crypto-regulation', title: 'Crypto Regulation', aliases: ['Crypto Regulation'] },
        { slug: 'antitrust', title: 'Antitrust', aliases: ['Antitrust'] },
        { slug: 'privacy-law', title: 'Privacy Law', aliases: ['Privacy Law', 'Data Privacy'] },
        { slug: 'gdpr', title: 'GDPR', aliases: ['GDPR'] }
    ],
    keywords: [
        { slug: 'immigration', title: 'Immigration', aliases: ['Immigration', 'Migrants'] },
        { slug: 'inflation', title: 'Inflation', aliases: ['Inflation', 'CPI'] },
        { slug: 'recession', title: 'Recession', aliases: ['Recession'] },
        { slug: 'interest-rates', title: 'Interest Rates', aliases: ['Interest Rates', 'Fed Rates'] },
        { slug: 'supply-chain', title: 'Supply Chain', aliases: ['Supply Chain', 'Logistics'] },
        { slug: 'remote-work', title: 'Remote Work', aliases: ['Remote Work', 'Work from Home'] },
        { slug: 'layoffs', title: 'Layoffs', aliases: ['Layoffs', 'Job Cuts'] }
    ],
    news: []
};

// Helper to look up simple category maps for the old config system if needed
export function getKeywordFromSlug(category: string, slug: string): SeoKeywordDef | undefined {
    // @ts-ignore
    const cat = SEO_CATEGORIES[category];
    if (!cat) return undefined;
    return cat.find((k: SeoKeywordDef) => k.slug === slug);
}
