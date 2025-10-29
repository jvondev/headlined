
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useSearchParams } from 'next/navigation';
import { Calendar, ArrowLeft, Twitter, Linkedin, Facebook } from 'lucide-react';

import Header from '@/components/common/Header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

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

// Helper to get data for a single post on the client-side from blogs.json
async function getPostClient(slug: string): Promise<PostData | null> {
  try {
    const res = await fetch(`/blogs.json`); // Fetch the generated JSON file
    if (!res.ok) {
      throw new Error(`Failed to fetch post JSON: ${res.statusText}`);
    }
    const posts: PostData[] = await res.json();
    const post = posts.find(p => p.slug === slug);
    return post || null;
  } catch (error) {
    console.error(`Error fetching or parsing post JSON for "${slug}":`, error);
    return null;
  }
}

export default function PostPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');
  const [post, setPost] = useState<PostData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        const fetchedPost = await getPostClient(slug);
        setPost(fetchedPost);
        setLoading(false);
      };
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
        <Header />
        <main className="flex-1 pt-12 w-full px-4 sm:px-6 lg:px-8 lg:mx-auto lg:max-w-7xl">
          <div className="max-w-prose mx-auto py-8 md:py-12">
            <Skeleton className="h-8 w-32 mb-6" />
            <Skeleton className="h-10 w-full mb-3" />
            <Skeleton className="h-6 w-5/6 mb-4" />
            <div className="flex items-center space-x-4 mb-8">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="w-full aspect-video rounded-lg mb-8" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-11/12" />
          </div>
        </main>
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const shareUrl = typeof window !== 'undefined' ? window.location.href : `https://readmore.in/blog/post?slug=${post.slug}`;

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
                {post.tags.map(tag => (
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

      <footer className="border-t">
        <div className="w-full px-4 sm:px-6 py-6 sm:py-8 text-center text-muted-foreground lg:container lg:mx-auto">
          <p className="mb-3 sm:mb-4">&copy; {new Date().getFullYear()} ReadMore. All Rights Reserved.</p>
          <div className="flex justify-center space-x-3 sm:space-x-4 text-xs sm:text-sm">
            <Link href="/about" className="hover:text-foreground">About Us</Link>
            <Link href="/contact" className="hover:text-foreground">Contact</Link>
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
