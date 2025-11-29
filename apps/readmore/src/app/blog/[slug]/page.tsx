
import { promises as fs } from 'fs';
import path from 'path';
import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, ArrowLeft, Twitter, Linkedin, Facebook } from 'lucide-react';

import { Header } from '@/components/common/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

// Define the shape of a full post (from blogs.json)
interface PostData {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  authorImage?: string;
  image: string;
  tags: string[];
  htmlContent: string; // The pre-rendered HTML content
}

// Helper to get data for a single post from blogs.json
async function getPost(slug: string): Promise<PostData | null> {
  try {
    const filePath = path.join(process.cwd(), 'public/blogs.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const posts: PostData[] = JSON.parse(fileContents);
    const post = posts.find(p => p.slug === slug);
    return post || null;
  } catch (error) {
    console.error(`Error fetching or parsing posts JSON:`, error);
    return null;
  }
}

// Generate static paths for all blog posts
export async function generateStaticParams() {
  try {
    const filePath = path.join(process.cwd(), 'public/blogs.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const posts: PostData[] = JSON.parse(fileContents);

    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
      console.error("Could not read blogs.json to generate static params", error);
      return [];
  }
}

// Generate metadata for each post page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}


export default async function PostPage({ params }: { params: { slug: string } }) {
    const post = await getPost(params.slug);

    if (!post) {
        notFound();
    }

    const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const shareUrl = `https://readmore.in/blog/${post.slug}`;

    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
            <Header />

            <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 lg:mx-auto lg:max-w-7xl">
                <article className="py-8 md:py-16">
                    <div className="max-w-prose mx-auto">
                        {/* Back Navigation */}
                        <Link href="/blog" passHref>
                            <Button variant="ghost" className="mb-6 text-muted-foreground hover:text-foreground text-sm sm:text-base">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Blog
                            </Button>
                        </Link>

                        {/* Post Header */}
                        <header className="mb-8">
                            <div className="flex flex-wrap gap-1 sm:gap-2 mb-2 sm:mb-4">
                                {post.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs sm:text-sm">{tag}</Badge>
                                ))}
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-2 sm:mb-4 text-foreground leading-tight">
                                {post.title}
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-4 sm:mb-6">
                                {post.description}
                            </p>

                            <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                                <span className="font-medium text-foreground">{post.author}</span>
                                <Separator orientation="vertical" className="h-4 sm:h-5" />
                                <div className="flex items-center space-x-1 sm:space-x-2">
                                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                                    <time dateTime={post.date}>{formattedDate}</time>
                                </div>
                            </div>
                        </header>

                        {/* Featured Image */}
                        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-8 sm:mb-10 border">
                            <Image
                                src={post.image}
                                alt={post.title}
                                fill // Replaces layout="fill"
                                className="bg-muted object-cover" // object-cover replaces objectFit="cover"
                                priority
                            />
                        </div>

                        {/* Post Content */}
                        <div
                            className="prose prose-sm sm:prose-base md:prose-lg dark:prose-invert max-w-none prose-headings:font-headline prose-headings:tracking-tight prose-a:text-primary hover:prose-a:underline prose-img:rounded-lg prose-img:border"
                            dangerouslySetInnerHTML={{ __html: post.htmlContent }}
                        />

                        <Separator className="my-8 sm:my-12" />

                        {/* Share Section */}
                        <aside className="text-center">
                            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Share This Post</h3>
                            <div className="flex justify-center items-center gap-3 sm:gap-4">
                                <a href={`https://twitter.com/intent/tweet?url=${shareUrl}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="icon"><Twitter className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
                                </a>
                                <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${shareUrl}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="icon"><Linkedin className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
                                </a>
                                <a href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`} target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" size="icon"><Facebook className="h-4 w-4 sm:h-5 sm:w-5" /></Button>
                                </a>
                            </div>
                        </aside>
                    </div>
                </article>
            </main>
        </div>
    );
}
