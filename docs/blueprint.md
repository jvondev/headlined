# **App Name**: ReadMore Blog

## Core Features:

- Insight Carousel: Vertical scrolling of text-based insights on the main route, mimicking TikTok's UI.
- Personalized Recommendations: Algorithm to recommend the next insight based on user interaction (likes, reading time) and localStorage to maintain state.
- Deep Dive Summaries: Vertical swipe action on each insight to reveal a deep dive summary with category-specific UIs.
- Full Blog Integration: Swipe-up from the deep dive to navigate to a full blog post /[slugs] route.
- Cross-Route Navigation: Consistent left/right swipe navigation across all routes (main, deep dive, full blog) to explore new insights, promoting continuous engagement.
- Data Schema: JSON data structure defining the insight, deep dive content (quote, QnA, how-to, checklist, case-study, data, myth, comparison table, alternatives), and the full blog content. Deep dive data is to be served from a 'blog' directory, where each filename slug maps to one data element in the json.

## Style Guidelines:

- Primary color: Soft gray (#333333) to promote focus and readability, aiming for calm engagement rather than excitement.
- Background color: Light gray (#F0F0F0), nearly white, offering a neutral canvas that reduces eye strain during prolonged use.
- Accent color: Medium gray (#777777) to highlight interactive elements and provide gentle visual cues without overwhelming the user.
- Body font: 'Inter', sans-serif, chosen for excellent legibility and a modern, neutral aesthetic that supports extended reading sessions.
- Headline font: 'Space Grotesk', sans-serif, used for titles and headings, giving a techy, progressive feel to shorter text elements.
- Use minimalist, line-based icons to represent content categories, enhancing navigation without distracting from the text.
- Maximize readability by using a single-column layout, generous line spacing, and optimized text width for long-form content.