import { NextResponse } from 'next/server';
import Parser from 'rss-parser';
import { createClient } from '@supabase/supabase-js';
import { sourcesData } from '@/data/sources-data'; // Assuming this path is correct
import { Database } from '@/types/supabase'; // NOTE: Ensure this type is generated from your Supabase schema.
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

const parser = new Parser();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase URL or Service Role Key');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

// Helper to get a nested property from an object
const getNestedProperty = (obj: any, path: string) => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
};

async function fetchArticleMetadata(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
    });
    if (!response.ok) {
      console.warn(`Failed to fetch article content from ${url}: ${response.statusText}`);
      return { description: null, thumbnailUrl: null };
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extract Open Graph / Twitter Card metadata
    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    const twitterDescription = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content');
    const metaDescription = document.querySelector('meta[name="description"]')?.getAttribute('content');
    const extractedDescription = ogDescription || twitterDescription || metaDescription;

    const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
    const twitterImage = document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
    const extractedThumbnailUrl = ogImage || twitterImage;

    // Fallback to Readability for description if metadata is not found
    let readabilityDescription: string | null = null;
    if (!extractedDescription) {
      const reader = new Readability(document);
      const article = reader.parse();
      if (article?.excerpt) {
        readabilityDescription = article.excerpt;
      }
    }

    return {
      description: extractedDescription || readabilityDescription,
      thumbnailUrl: extractedThumbnailUrl,
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${url}:`, error);
    return { description: null, thumbnailUrl: null };
  }
}

export async function GET(request: Request) {
  console.log('Starting RSS feed generation...');
  let processedCount = 0;
  let errorCount = 0;

  const { searchParams } = new URL(request.url);
  const targetSourceName = searchParams.get('sourceName');

  const sourcesToProcess = targetSourceName
    ? sourcesData.filter(source => source.name === targetSourceName)
    : sourcesData; // If no sourceName, process all (but this might timeout)

  if (sourcesToProcess.length === 0) {
    console.warn(`No sources found to process for targetSourceName: ${targetSourceName || 'all'}`);
    return NextResponse.json({
      message: 'No sources found to process',
      processedCount,
      errorCount,
    });
  }

  for (const source of sourcesToProcess) {
    try {
      console.log(`Fetching feed for source: ${source.name} from ${source.url}`);
      const feed = await parser.parseURL(source.url);

      let itemsProcessedForSource = 0;
      for (const item of feed.items) {
        if (source.maxItems && itemsProcessedForSource >= source.maxItems) {
          console.log(`Max items (${source.maxItems}) reached for source: ${source.name}. Skipping remaining items.`);
          break;
        }

        const config = source.parserConfig;

        const title = config?.title ? getNestedProperty(item, config.title) : item.title;
        const link = config?.link ? getNestedProperty(item, config.link) : item.link;
        const pubDateStr = config?.pubDate ? getNestedProperty(item, config.pubDate) : item.pubDate;
        const pubDate = pubDateStr ? new Date(pubDateStr).toISOString() : new Date().toISOString();
        let description = config?.description ? getNestedProperty(item, config.description) : (item.contentSnippet || item.summary || item.content || null);
        let thumbnailUrl = config?.thumbnailUrl ? getNestedProperty(item, config.thumbnailUrl) : (item.enclosure?.url || item.media?.content?.[0]?.$.url || null);

        if (!title || !link) {
          console.warn(`Skipping item due to missing title or link: ${JSON.stringify(item)}`);
          errorCount++;
          continue;
        }

        // If description or thumbnail is missing, try to scrape the article link
        if ((!description || !thumbnailUrl) && link) {
          console.log(`Scraping metadata for ${link}`);
          const scrapedMetadata = await fetchArticleMetadata(link);
          if (!description) {
            description = scrapedMetadata.description;
          }
          if (!thumbnailUrl) {
            thumbnailUrl = scrapedMetadata.thumbnailUrl;
          }
          // Add a random delay to be stealthy and avoid hammering sites
          const randomDelay = Math.floor(Math.random() * (500 - 100 + 1)) + 100; // Random between 100ms and 500ms
          await new Promise(resolve => setTimeout(resolve, randomDelay));
        }

        // Generate a simple slug from the title or link
        const slug = title
          ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
          : link.split('/').pop()?.split('?')[0] || `post-${Date.now()}`;

        const { data: existingPost, error: fetchError } = await supabase
          .from('posts')
          .select('title, description, thumbnail_url, topic')
          .eq('link', link)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 means no rows found
          console.error(`Error fetching existing post for ${link}:`, fetchError);
          errorCount++;
          continue;
        }

        const postData = {
          slug: slug,
          title: title,
          description: description,
          link: link,
          thumbnail_url: thumbnailUrl,
          created_at: new Date().toISOString(),
          topic: source.topic,
        };

        // Compare with existing post to skip upsert if no changes
        if (existingPost) {
          const hasChanges = 
            existingPost.title !== postData.title ||
            existingPost.description !== postData.description ||
            existingPost.thumbnail_url !== postData.thumbnail_url ||
            existingPost.topic !== postData.topic;

          if (!hasChanges) {
            console.log(`Skipping upsert for ${link} as no changes detected.`);
            processedCount++; // Count as processed even if skipped
            itemsProcessedForSource++;
            continue;
          }
        }

        const { data, error } = await supabase
          .from('posts')
          .upsert(
            postData,
            { onConflict: 'link', ignoreDuplicates: false } // Upsert based on link to avoid duplicates
          );

        if (error) {
          console.error(`Error inserting/updating post for ${source.name}:`, error);
          errorCount++;
        } else {
          processedCount++;
          itemsProcessedForSource++;
        }
      }
    } catch (error) {
      console.error(`Failed to process feed for ${source.name}:`, error);
      errorCount++;
    }
  }

  console.log(`RSS feed generation finished. Processed: ${processedCount}, Errors: ${errorCount}`);
  return NextResponse.json({
    message: 'RSS feed generation complete',
    processedCount,
    errorCount,
  });
}
