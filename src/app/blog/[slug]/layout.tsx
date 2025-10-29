
import fs from 'fs';
import path from 'path';
import type { Metadata } from 'next';

// Define the shape of post metadata (from blog-index.json)
interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  image: string;
  tags: string[];
}

// Define the shape of a full post (from [slug].json)
interface PostData extends PostMetadata {
  htmlContent: string; // The pre-rendered HTML content
  authorImage?: string;
}

// Helper to get post data (runs at build time)
async function getPostData(slug: string): Promise<PostData | null> {
  const postJsonPath = path.join(process.cwd(), 'public/blog', `${slug}.json`);
  if (!fs.existsSync(postJsonPath)) {
    console.warn(`Post JSON file not found at build time for slug: ${slug}`);
    return null;
  }
  const fileContents = fs.readFileSync(postJsonPath, 'utf8');
  return JSON.parse(fileContents) as PostData;
}

// This function runs at build time to tell Next.js which static paths to generate.
export async function generateStaticParams() {
  const blogIndexFilePath = path.join(process.cwd(), 'public/blog/blog-index.json');
  if (!fs.existsSync(blogIndexFilePath)) {
    console.warn('public/blog/blog-index.json not found for generateStaticParams. Ensure generate-blog-data.ts has been run.');
    return [];
  }
  const fileContents = fs.readFileSync(blogIndexFilePath, 'utf8');
  const posts: PostMetadata[] = JSON.parse(fileContents);
  return posts.map(post => ({
    slug: post.slug,
  }));
}

// This function runs at build time to generate SEO metadata for each static page.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await getPostData(params.slug);

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post does not exist.',
    };
  }

  // For static exports, this is crucial. Replace with your actual deployed domain.
  const metadataBase = new URL('https://your-production-domain.com'); // <<< IMPORTANT: REPLACE WITH YOUR PRODUCTION DOMAIN

  return {
    metadataBase,
    title: `${post.title} | ReadMore Blog`,
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
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.description,
      images: [post.image],
    },
  };
}

// This layout component wraps the page. It's a server component implicitly.
export default function SlugLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}
