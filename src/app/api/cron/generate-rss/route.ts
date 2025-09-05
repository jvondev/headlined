import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Parser from 'rss-parser';
import { generateSlug, extractFullContent } from '@/lib/rss';
import { RssArticle, RssFeed } from '@/types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for cron job

const parser = new Parser();

export async function GET() {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return NextResponse.json(
      { error: 'Supabase URL and/or Service Role Key are not set.' },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { data: rssSources, error: fetchError } = await supabase
      .from('rss_sources')
      .select('*')

    if (fetchError) {
      console.error('Error fetching RSS sources:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch RSS sources.' },
        { status: 500 }
      );
    }

    if (!rssSources || rssSources.length === 0) {
      return NextResponse.json(
        { message: 'No RSS sources found in database.' },
        { status: 200 }
      );
    }

    let newPostsCount = 0;
    const allProcessedArticles: RssArticle[] = [];

    for (const source of rssSources) {
      try {
        const feed = await parser.parseURL(source.url);

        for (const item of feed.items.slice(0, 15)) {
          // Basic validation for required fields
          if (!item.link || !item.title || !item.pubDate) {
            console.warn(
              `Skipping item from ${source.name} due to missing link, title, or pubDate:`,
              item
            );
            continue;
          }

                const description = (item.summary || item.contentSnippet || '')
                  .replace(/\[&#8230;\]/g, '') // removes [&#8230;]
                  .replace(/…/g, '')           // removes …
                  .trim();

                let thumbnailUrl;
                if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
                    thumbnailUrl = item.mediaContent.$.url;
                } else if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image')) {
                    thumbnailUrl = item.enclosure.url;
                }

                const categories: string[] = [];
                const rawCategories = item.categories || (item.category ? [item.category] : []);

                // Ensure rawCategories is always an array for consistent processing
                const categoriesToProcess = Array.isArray(rawCategories) ? rawCategories : [rawCategories];

                for (const cat of categoriesToProcess) {
                    if (typeof cat === 'string') {
                        categories.push(cat);
                    } else if (typeof cat === 'object' && cat !== null && cat.term) {
                        categories.push(cat.term);
                    }
                }

                const basicArticleData = {
                    slug: (await generateSlug(item.title, source.url)).replace('rss-', ''),
                    title: item.title,
                    description: description,
                    link: item.link,
                    pubDate: item.pubDate,
                    author: item.creator || '',
                    thumbnailUrl: thumbnailUrl,
                    originalFeedUrl: source.url,
                    categories: categories, // Add categories here
                };

                let finalArticle: RssArticle | null = null; // Declare finalArticle here

                try {
                    const { blogContent, byline, contentDoc, deepDives } = await extractFullContent(item, basicArticleData);
                    const finalAuthor = byline || basicArticleData.author;

                    if (!thumbnailUrl) {
                        const imagePatterns = [
                            /<meta\s+property="og:image"\s+content="([^"]+)"/,
                            /<meta\s+name="twitter:image"\s+content="([^"]+)"/,
                            /<img[^>]+src="([^"]+)"/
                        ];

                        const contentHtml = contentDoc.body.innerHTML;

                        for (const pattern of imagePatterns) {
                            const match = contentHtml.match(pattern);
                            if (match && match[1]) {
                                thumbnailUrl = match[1];
                                break;
                            }
                        }
                    }

                    finalArticle = { // Assign to finalArticle
                        ...basicArticleData,
                        author: finalAuthor,
                        blogContent,
                        thumbnailUrl: thumbnailUrl,
                        deepDives,
                    };

                    allProcessedArticles.push(finalArticle);

                } catch (error: unknown) {
                    console.error(`Failed to process article ${item.title} (${item.link}):`, error);
                }

          if (!finalArticle) {
                    console.warn(`Skipping upsert for ${item.title} due to missing finalArticle data.`);
                    continue;
                }

          // Check if post already exists based on link
          const { data: existingPost, error: checkError } = await supabase
            .from('blog_posts')
            .select('id')
            .eq('link', item.link)
            .single();

          if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows found
            console.error(`Error checking existing post for ${item.link}:`, checkError);
            continue;
          }

          if (existingPost) {
            // console.log(`Post already exists: ${item.title}`);
            continue; // Skip if post already exists
          }

          // Insert new post
          const { error: insertError } = await supabase.from('blog_posts').upsert({
            slug: finalArticle.slug,
            title: item.title,
            description: finalArticle.description,
            link: item.link,
            pub_date: new Date(item.pubDate).toISOString(),
            author: finalArticle.author,
            thumbnail_url: finalArticle.thumbnailUrl,
            original_feed_url: source.url,
            blog_content: finalArticle.blogContent,
            // IMPORTANT: The 'category' column in Supabase 'blog_posts' table needs to be of type TEXT[] (array of text)
            // for this to work correctly. If it's currently TEXT, you'll need to perform a schema migration.
            category: finalArticle.categories.length > 0 ? finalArticle.categories : [source.category],
            source: source.name, // Use source.name from rss_sources table
          });

          if (insertError) {
            console.error(`Error inserting post ${item.title}:`, insertError);
          } else {
            newPostsCount++;
            console.log(`Inserted new post: ${item.title}`);
          }
        }
      } catch (parseError) {
        console.error(`Error parsing feed for ${source.name}:`, parseError);
      }
    }

    return NextResponse.json(
      { message: `Cron job completed. Inserted ${newPostsCount} new posts.` },
      { status: 200 }
    );
  } catch (generalError) {
    console.error('General error during cron job:', generalError);
    return NextResponse.json(
      { error: 'An unexpected error occurred during the cron job.' },
      { status: 500 }
    );
  }
}
