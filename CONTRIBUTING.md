# Contributing to Headlined 🗞️

First off, thank you for considering contributing to Headlined! It's people like you that make Headlined such a great tool.

## 🛠️ Local Development

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup
1. Fork and clone the repo
2. Run `npm install` to install dependencies
3. Copy `.env.example` to `.env.local`
4. Run `npm run dev` to start the Next.js development server

### Running the Scraper Locally
If you are working on the scraper logic or adding new RSS feeds:
1. Ensure `GITHUB_TOKEN` is set in your `.env.local`
2. Run `npm run scrape`
3. Check the `scripts/output/` directory for the generated JSON files

## 📰 Adding New RSS Feeds

We welcome pull requests to add high-quality, reliable news sources.

1. Open `scripts/scraper/sources.ts`
2. Scroll to the `sourcesData` array at the bottom.
3. Add your source: `{ name: "Source Name", url: "https://url.com/rss", topic: "default_topic" }`
4. Run `npm run scrape` to verify the feed parses correctly.

**Requirements for new feeds:**
- Must provide full articles or substantial summaries in the RSS output.
- Must be a highly reputable source (no spam/clickbait farms).
- Try to ensure the `topic` aligns with our existing regex rules in `GLOBAL_TOPIC_RULES`.

## 🐛 Reporting Bugs & Requesting Features

- Check if the issue already exists in the Issues tab.
- Use the provided Issue Templates.
- Provide as much context as possible (browser, OS, screenshots).

## 🚀 Pull Request Process

1. Create a new branch from `main`.
2. Make your changes.
3. Ensure the project builds successfully (`npm run build`).
4. Submit a PR using our Pull Request Template.

Thank you for contributing!
