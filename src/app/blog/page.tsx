
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, User } from 'lucide-react';

import {Header} from '@/components/common/Header';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { LineShadowText } from '@/components/ui/line-shadow-text';
import { Skeleton } from '@/components/ui/skeleton';

// Define the shape of a post (matching what will be in blogs.json)
interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  image: string;
  tags: string[];
}

// Helper to get all post metadata from blogs.json client-side
async function getAllPostsMetadata(): Promise<PostMetadata[]> {
  try {
    const res = await fetch('/blogs.json'); // Fetch the generated JSON
    if (!res.ok) {
      console.error(`Failed to fetch /blogs.json: ${res.statusText}`);
      return [];
    }
    const posts: PostMetadata[] = await res.json();
    // Ensure posts are sorted by date, newest first
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Error fetching or parsing /blogs.json:', error);
    return [];
  }
}

// Animation variants
const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function BlogPage() {
  const [posts, setPosts] = useState<PostMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const fetchedPosts = await getAllPostsMetadata();
      setPosts(fetchedPosts);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 pt-12 lg:mx-auto lg:max-w-7xl">
        {/* Hero Section for Blog */}
        <section className="relative py-16 md:py-24 text-center">
          <motion.div
            className="relative w-full lg:container lg:mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.h1 variants={fadeIn} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter mb-4 sm:mb-6 font-headline leading-tight">
              <LineShadowText as="span">Our</LineShadowText> <LineShadowText as="span">Latest</LineShadowText> <LineShadowText as="span">Articles</LineShadowText>
            </motion.h1>
            <motion.p variants={fadeIn} className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-muted-foreground mb-8 sm:mb-10 px-2">
              Dive into our collection of insightful posts, covering a wide range of topics to keep you informed and inspired.
            </motion.p>
          </motion.div>
        </section>

        {/* Blog Posts Grid */}
        <section className="w-full py-8 md:py-16">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-card border rounded-lg overflow-hidden flex flex-col">
                  <Skeleton className="relative w-full aspect-video" />
                  <div className="p-4 sm:p-6 flex-1 flex flex-col">
                    <Skeleton className="h-4 w-1/4 mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, amount: 0.3 }}
            >
              {posts.map((post) => (
                <motion.div key={post.slug} variants={fadeIn} className="bg-card border rounded-lg overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative w-full aspect-video">
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill // Replaces layout="fill"
                        className="bg-muted object-cover" // object-cover replaces objectFit="cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  </Link>
                  <div className="p-4 sm:p-6 flex-1 flex flex-col">
                    <div className="flex flex-nowrap gap-1 sm:gap-2 mb-2 sm:mb-3 overflow-hidden">
                      {post.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs sm:text-sm flex-shrink-0">{tag}</Badge>
                      ))}
                    </div>
                    <Link href={`/blog/${post.slug}`} className="block hover:underline">
                      <h2 className="text-lg sm:text-xl font-bold tracking-tight mb-1 sm:mb-2 leading-snug text-foreground">
                        {post.title}
                      </h2>
                    </Link>
                    <p className="text-muted-foreground text-xs sm:text-sm line-clamp-3 mb-3 sm:mb-4 flex-1">
                      {post.description}
                    </p>
                    <div className="flex items-center text-xs sm:text-sm text-muted-foreground mt-auto">
                      <div className="flex items-center mr-3 sm:mr-4">
                        <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <span>{post.author}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        <time dateTime={post.date}>
                          {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </time>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
           {posts.length === 0 && !loading && (
            <div className="text-center py-10 md:py-20 text-muted-foreground">
              <p className="text-base sm:text-lg">No blog posts found yet. Check back soon!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
