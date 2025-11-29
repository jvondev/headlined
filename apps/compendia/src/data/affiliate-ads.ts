
export interface AffiliateAdVariant {
    title: string;
    description: string;
    asset: string; // Image URL
    link: string;
}

export interface AffiliateProgram {
    name: string;
    variants: AffiliateAdVariant[];
    topics?: string[]; // Optional: Target specific topics
    interests?: string[]; // Optional: Target specific interests
    frequency?: {
        min: number;
        max: number;
    };
}

export const affiliateAds: AffiliateProgram[] = [
    {
        name: "UpBase",
        variants: [
            {
                title: "UpBase: The All-In-One Project Management Platform",
                description: "Stop juggling multiple apps. UpBase combines tasks, docs, files, and discussions in one place. It's the unique project management tool that helps you stay focused and productive.",
                asset: "https://assets.upbase.io/upbase/v2/home/Upbase_apps_combination.webp",
                link: "https://upbase.io/?via=readmore",
            },
            {
                title: "Simplify Your Workflow with UpBase",
                description: "Manage your projects, tasks, and team collaboration effortlessly. UpBase is designed to help you get more done with less stress. Try it for free.",
                asset: "https://appsumo2-cdn.appsumo.com/media/deals/images/fffa434f-9a34-424d-b120-86d817b7daf2_uuid_49c43622-d667-46ee-ac7e-ed0dd99f8471.png?width=832&height=468&aspect_ratio=16:9&optimizer=gif",
                link: "https://upbase.io/?via=readmore",
            }
        ],
        topics: ["tech", "business", "jobs"],
        interests: ["productivity", "personal growth"],
        frequency: {
            min: 5,
            max: 10,
        },
    },
];
