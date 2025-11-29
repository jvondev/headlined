import {
    Megaphone,
    Tv,
    Globe,
    TrendingUp,
    DollarSign,
    Gavel,
    Zap
} from "lucide-react";

export type DistractionFilter = {
    id: string;
    label: string;
    description: string;
    keywords: string[];
    icon: any;
};

export const DISTRACTION_FILTERS: DistractionFilter[] = [
    {
        id: "politics",
        label: "Politics",
        description: "Elections, debates, and partisan noise",
        icon: Megaphone,
        keywords: [
            "politics", "election", "vote", "campaign", "senate", "congress",
            "president", "minister", "parliament", "democrat", "republican",
            "policy", "biden", "trump", "legislation", "voter", "ballot"
        ]
    },
    {
        id: "celebrity",
        label: "Celebrity",
        description: "Gossip, dating news, and influencer drama",
        icon: Tv,
        keywords: [
            "celebrity", "gossip", "kardashian", "royal", "hollywood",
            "dating", "star", "actor", "actress", "fame", "scandal",
            "rumor", "influencer", "red carpet", "paparazzi"
        ]
    },
    {
        id: "worldNews",
        label: "Conflict",
        description: "War, disasters, and distressing events",
        icon: Globe,
        keywords: [
            "war", "conflict", "disaster", "earthquake", "flood", "fire",
            "attack", "crisis", "bomb", "killed", "death", "murder",
            "shooting", "casualty", "terror", "hostage"
        ]
    },
    {
        id: "finance",
        label: "Hype",
        description: "Crypto, stock surges, and financial FOMO",
        icon: DollarSign,
        keywords: [
            "crypto", "bitcoin", "nft", "stock market", "surge", "crash",
            "bull run", "bear market", "investment", "rich", "millionaire",
            "blockchain", "ethereum"
        ]
    },
    {
        id: "deals",
        label: "Deals & Promotions",
        description: "Sales, discounts, and limited-time offers",
        icon: Zap,
        keywords: [
            "sale", "discount", "offer", "deal", "promo", "coupon",
            "limited time", "bargain", "save", "free", "flash sale",
            "clearance", "rebate", "special"
        ]
    },
    {
        id: "crime",
        label: "Crime",
        description: "Arrests, court cases, and police reports",
        icon: Gavel,
        keywords: [
            "arrest", "police", "court", "trial", "judge", "prison",
            "jail", "suspect", "guilty", "sentence", "lawsuit",
            "alleged", "investigation"
        ]
    }
];
