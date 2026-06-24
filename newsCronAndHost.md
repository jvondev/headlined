# Cron Job and Hosting Plan

## Workflow

1.  **Daily Cron Job (Vercel):**
    *   A cron job runs once every day at 23:00 UTC.
    *   It is a separate project written in **Node.js** using the **Hono** framework, ensuring high performance for data processing.
    *   It fetches and parses multiple RSS feeds concurrently.
    *   For each article, it scrapes the content to ensure all necessary metadata (like thumbnails and descriptions) is present.
    *   All article data is then saved (upserted) to the Supabase database.

2.  **Daily Content Update (GitHub Actions):**
    *   Every day at midnight UTC (one hour after the cron job), a GitHub Action runs.
    *   This action fetches the latest posts from the Supabase database.
    *   It commits the new data as a JSON file to the repository.

3.  **Deployment (Cloudflare Pages):**
    *   The main frontend application is hosted on Cloudflare Pages.
    *   A new build is automatically triggered by Cloudflare whenever a commit is pushed to the repository (e.g., when the GitHub Action updates the posts file).

## Technology Summary

*   **Cron Job:** Deployed as a Serverless Function on **Vercel**, written in **Node.js** with **Hono**, `rss-parser`, and `node-html-parser` for maximum performance.
*   **Frontend:** Deployed on **Cloudflare Pages** as a client-side rendered application.
*   **Database:** **Supabase** acts as the central database for storing articles.
*   **CI/CD:** **GitHub Actions** automates the process of updating content in the repository.
