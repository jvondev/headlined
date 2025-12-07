export interface CategoryDefinition {
    id: string;
    label: string; // Human readable label
    keywords: string[]; // Simple string matches (case insensitive)
    exclude?: string[]; // Keywords to exclude if present
    patterns?: RegExp[]; // Complex regex matches
}

export const CATEGORIES: CategoryDefinition[] = [
    {
        id: 'location',
        label: 'Location',
        keywords: [
            'San Diego', 'Florida', 'Pakistan', 'New York', 'London', 'Paris', 'Tokyo',
            'California', 'Texas', 'India', 'China', 'Russia', 'Ukraine', 'Israel', 'Gaza',
            'Washington', 'Beijing', 'Moscow', 'Kyiv', 'Brussels', 'Ottawa'
        ]
    },
    {
        id: 'people',
        label: 'People',
        keywords: [
            'Trump', 'Biden', 'Musk', 'Zuckerberg', 'Putin', 'Zelenskyy', 'Xi Jinping',
            'Modi', 'Netanyahu', 'Macron', 'Sunak', 'Scholz'
        ]
    },
    {
        id: 'media',
        label: 'Media',
        keywords: ['BBC', 'CNN', 'Fox News', 'WWE', 'Disney', 'Netflix', 'Warner Bros', 'Paramount', 'Sony Pictures']
    },
    {
        id: 'team',
        label: 'Team',
        keywords: ['NFL', 'NBA', 'MLB', 'NHL', 'Premier League', 'Lakers', 'Warriors', 'Yankees', 'Dodgers', 'Cowboys', 'Chiefs']
    },
    {
        id: 'topics',
        label: 'Topics',
        keywords: ['Tech', 'Business', 'Economy', 'Politics', 'Health', 'Entertainment', 'Sports', 'Science', 'World']
    },
    {
        id: 'industry',
        label: 'Industry',
        keywords: ['Real Estate', 'Energy', 'Automotive', 'Banking', 'Retail', 'Healthcare', 'Construction', 'Manufacturing', 'Technology']
    },
    {
        id: 'interest',
        label: 'Interest',
        keywords: ['AI', 'Crypto', 'Gaming', 'Fitness', 'Travel', 'Cooking', 'Fashion', 'Photography', 'Writing', 'Coding']
    },
    {
        id: 'company',
        label: 'Company & Brand',
        keywords: ['Apple', 'Google', 'Microsoft', 'Amazon', 'Meta', 'Tesla', 'Nvidia', 'Samsung', 'Toyota', 'Volkswagen']
    },
    {
        id: 'event',
        label: 'Events',
        keywords: ['Election', 'Olympics', 'World Cup', 'Super Bowl', 'Eurovision', 'Oscars', 'Grammys', 'CES', 'WWDC']
    },
    {
        id: 'product',
        label: 'Product',
        keywords: ['iPhone', 'iPad', 'MacBook', 'ChatGPT', 'Pixel', 'Galaxy', 'Xbox', 'PlayStation', 'Windows', 'Vision Pro']
    },
    {
        id: 'legal',
        label: 'Legal & Crime',
        keywords: ['Supreme Court', 'Federal Court', 'Lawsuit', 'Crime', 'Regulation', 'DoJ', 'Judge', 'Verdict', 'Indictment']
    },
    {
        id: 'demographic',
        label: 'Demographic',
        keywords: ['Student', 'Veteran', 'Small Business', 'Investor', 'Founder', 'Millennial', 'Gen Z', 'Retiree']
    },
    {
        id: 'government',
        label: 'Government',
        keywords: ['FBI', 'CIA', 'Pentagon', 'SEC', 'IRS', 'FDA', 'EPA', 'NASA', 'DHS', 'State Department']
    },
    {
        id: 'weather',
        label: 'Weather & Nature',
        keywords: ['Hurricane', 'Earthquake', 'Tornado', 'Flood', 'Wildfire', 'Tsunami', 'Climate Change', 'Heatwave', 'Storm']
    },
    {
        id: 'education',
        label: 'Education',
        keywords: ['Harvard', 'Yale', 'University', 'College', 'School District', 'Admissions', 'Student Debt', 'Tuition']
    },
    {
        id: 'science',
        label: 'Science',
        keywords: ['Space', 'NASA', 'Physics', 'Biology', 'Chemistry', 'Astronomy', 'Medical Research', 'Quantum', 'Fusion']
    },
    {
        id: 'conflict',
        label: 'Conflict & Security',
        keywords: ['War', 'Military', 'Terrorism', 'Cyberattack', 'National Security', 'Defense', 'Army', 'Navy', 'Air Force']
    },
    {
        id: 'regulation',
        label: 'Regulation & Policy',
        keywords: ['Tax Law', 'Immigration Policy', 'AI Regulation', 'Crypto Regulation', 'Antitrust', 'Privacy Law', 'GDPR']
    },
    {
        id: 'keywords',
        label: 'Keywords',
        keywords: ['Immigration', 'Inflation', 'Recession', 'Interest Rates', 'Supply Chain', 'Remote Work', 'Layoffs']
    }
];
