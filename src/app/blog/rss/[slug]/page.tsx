
import { BlogPageClient } from "../../[slug]/client";
import type { Metadata } from "next";

// This function is for metadata generation only.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const title = params.slug.split('-').slice(1).join(' ').replace(/\b\w/g, l => l.toUpperCase());
  return {
    title: `${title} | ReadMore`,
    description: "Loading article from ReadMore...",
  };
}

// This page component is now fully synchronous. It renders the client component,
// which will then fetch the data on the client side, showing a skeleton instantly.
export default function RssBlogPostPage({ params }: { 
    params: { slug: string }
}) {
  const fullSlug = `rss-${params.slug}`;

  // We pass the slug to the client component. It will show a skeleton
  // and then fetch the data itself. initialInsight is explicitly not passed.
  return <BlogPageClient slug={fullSlug} />;
}
