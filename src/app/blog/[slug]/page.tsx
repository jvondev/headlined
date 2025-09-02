import { notFound } from "next/navigation";
import { BlogPageClient } from "./client";
import type { Metadata } from "next";
import { promises as fs } from 'fs';
import path from 'path';

interface Article {
  slug: string;
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  author: string;
  blogContent: string;
  originalFeedUrl: string;
}

export const revalidate = 3600; // Revalidate every hour

async function getArticleData(slug: string) {
    const categories = ["design", "news", "tech"]; // Example categories

    for (const category of categories) {
        try {
            const filePath = path.join(process.cwd(), 'public', 'generated-categories', `${category}.json`);
            const fileContent = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(fileContent);
            
            for (const sourceName in data) {
                if (Object.prototype.hasOwnProperty.call(data, sourceName)) {
                    const sourceArticles: Article[] = data[sourceName];
                    const foundArticle = sourceArticles.find(art => art.slug === slug);
                    if (foundArticle) {
                        // Map Article to a basic Insight structure for BlogPageClient
                        return {
                            insight: {
                                slug: foundArticle.slug,
                                title: foundArticle.title,
                                headline: foundArticle.title,
                                summary: foundArticle.summary,
                                blogContent: foundArticle.blogContent,
                                thumbnailUrl: undefined,
                                category: [], // Can be populated if needed
                                deepDives: [],
                                seo: { title: foundArticle.title, description: foundArticle.summary },
                            }
                        };
                    }
                }
            }
        } catch (error) {
            console.error(`Error reading or parsing ${category}.json:`, error);
        }
    }
    return { insight: undefined };
}

export async function generateStaticParams() {
  const categories = ["design", "news", "tech"]; // Example categories
  let allSlugs: { slug: string }[] = [];

  for (const category of categories) {
    try {
      const filePath = path.join(process.cwd(), 'public', 'generated-categories', `${category}.json`);
      const fileContent = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(fileContent);

      for (const sourceName in data) {
        if (Object.prototype.hasOwnProperty.call(data, sourceName)) {
          const sourceArticles: Article[] = data[sourceName];
          allSlugs = [...allSlugs, ...sourceArticles.map(art => ({ slug: art.slug }))];
        }
      }
    } catch (error) {
      console.error(`Error reading or parsing ${category}.json for static params:`, error);
    }
  }
  return allSlugs;
}

type BlogPageProps = {
    params: {
        slug: string;
    },
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  // Only pre-generate metadata for non-RSS articles for performance
  if(params.slug.startsWith('rss-')) {
    return { title: "ReadMore" };
  }
  const { insight } = await getArticleData(params.slug);

  if (!insight) {
    return {};
  }

  return {
    title: insight.seo.title,
    description: insight.seo.description,
  };
}


export default async function BlogPostPage({ params, searchParams }: BlogPageProps) {
  // We only pre-fetch for non-RSS content for SEO and initial load performance.
  // The client component will handle fetching for RSS or if data is missing.
  const isRss = params.slug.startsWith('rss-');
  const fromSaved = searchParams.from === 'saved';
  let initialInsight;

  if (!isRss && !fromSaved) {
    const { insight } = await getArticleData(params.slug);
    if (!insight) {
      notFound();
    }
    initialInsight = insight;
  }
  
  // The client component will handle rendering, and fetching if necessary.
  return <BlogPageClient slug={params.slug} initialInsight={initialInsight} />;
}