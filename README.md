# <img src="public/headlined-logo.svg" height="40" align="top"> Headlined

![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)
![GitHub Actions](https://img.shields.io/github/actions/workflow/status/jvondev/Headlined/scraper.yml?label=Scraper%20Cron)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![GitHub stars](https://img.shields.io/github/stars/jvondev/Headlined?style=social)

A curated, ad-free news aggregator built for the modern attention span. Headlined transforms traditional, cluttered news reading into a seamless, immersive TikTok-style swiping experience.

<div align="center">
  <img src="./public/videos/headlined-demo-part2.gif" width="100%" alt="TikTok-style swiping interface">
  <p><em>Immersive TikTok-style swiping interface built with Embla Carousel.</em></p>
</div>

### 🌟 Feature Showcase

| Topic Intelligence | AI-Enhanced Detail View |
| :---: | :---: |
| <img src="./public/videos/headlined-demo-part1.gif" width="100%"> | <img src="./public/videos/headlined-demo-part3.gif" width="100%"> |
| *Filters raw streams into personalized interest vectors.* | *AI-generated highlights and dynamic typography scaling.* |

| Discovery Dashboard |
| :---: |
| <img src="./public/videos/headlined-demo-part4.gif" width="100%"> |
| *Local-first search hub using FlexSearch and IndexedDB.* |

## 💡 The Product Philosophy

**The Problem:** Reading the news today is exhausting. It's fragmented across dozens of apps, bloated with pop-ups, and overwhelming to navigate.
**The Solution:** Headlined aggregates 15+ top-tier sources (Hacker News, Bloomberg, BBC, etc.) into a single, unified feed. By adopting a vertical-scroll UX (like TikTok/Reels), it reduces cognitive load and makes catching up on the world's events effortless and engaging.

### User-First Features
- **Immersive UX:** Full-page swipe gestures. Read the headlines instantly, swipe for the next.
- **Zero Distractions:** Stripped of ads, pop-ups, and trackers. Just the news.
- **Smart Curation:** Articles are automatically categorized into Topics (Tech, Finance, Politics) so you only see what you care about.
- **PWA Ready:** Installable on iOS/Android for a native app feel.

---

## 🛠️ The Engineering: $0 Cost High-Performance Data Pipeline

As a Product Engineer, the goal was to build a highly scalable app with **sustainable business constraints**. Instead of paying for expensive database hosting (e.g., Supabase/Firebase) to store thousands of daily articles, Headlined uses an insanely optimized **Binary TSV Streaming Architecture**.

1. **The Scraper (GitHub Actions):** A cron job spins up every 6 hours to fetch fresh RSS feeds.
2. **TSV Binary Compression:** The Node.js engine truncates full articles to semantic summaries, maps fields to a compact TSV format, and compresses them using GZIP (`.tsv.gz`). This achieves an astonishing **96% data reduction** compared to raw JSON.
3. **The "Database" (GitHub CDN):** The newly appended binary chunks are pushed directly to an orphaned `data` branch, entirely avoiding GitHub Release limits or blob history bloat.
4. **The Client Engine (Next.js & IndexedDB):** The browser natively unzips the `tsv.gz` stream using the Web Streams API (`DecompressionStream(gzip)`). The lightweight data is instantly parsed and permanently synced into the user's local **IndexedDB**, guaranteeing zero latency offline reading.

## 🏗️ Architecture & Technical Details

Headlined is designed to operate completely independently with zero recurring infrastructure costs.

- **Serverless Upserting Pipeline:** The backend operates via GitHub Actions. A cron job executes every 6 hours, downloading the *existing* daily `.tsv.gz` from the GitHub CDN, performing deduplication, upserting the new payload, and force-pushing it back to the `data` branch.
- **Microscopic Delivery:** By ditching JSON arrays for Tab-Separated Values, the client avoids massive JSON parsing overhead. Line-by-line streaming allows the app to render content while the network payload is still arriving.
- **Client-Side Optimization:** The vertical scrolling UI utilizes Intersection Observers to lazily load DOM nodes and media. This keeps memory usage low and ensures 60fps scrolling on mobile devices.
- **Offline Local-First Caching:** Using IndexedDB, historic reads are cached permanently on the device, meaning users can swipe through yesterday's news instantly in Airplane mode.
- **Content Syndication:** Implements dynamic canonical tags pointing to original publisher URLs, ensuring proper SEO attribution and preventing duplicate content penalties.

---

## 🚀 Deploy Your Own

1. **Fork & Setup**
   Fork this repository. Create a `GITHUB_TOKEN` (with `repo` scope) in your GitHub Developer Settings, and add it to your repo's Actions Secrets.
2. **Initialize the Pipeline**
   Go to the Actions tab and manually run the **Daily RSS Scraper** workflow. This will automatically create the `data` branch and push your first `.tsv.gz` payload.
3. **Deploy the Frontend**
   Deploy your fork to Vercel (Next.js preset). It will instantly point to your custom data branch.

## 🔌 Public TSV Stream API

Headlined automatically serves as an open, lightning-fast TSV API. You can build mobile apps or alternate clients by fetching the raw binary `.tsv.gz` directly from the raw data branch:
```text
https://raw.githubusercontent.com/jvondev/headlined/data/rss-data-YYYY/YYYY-MM-DD.tsv.gz
```
*(Simply pipe it through a DecompressionStream and split by tabs to consume!)*

## 📜 License
GNU AGPLv3 License. Built for the open-source community.
