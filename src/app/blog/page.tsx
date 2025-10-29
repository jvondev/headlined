
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { promisify } from 'util';
import { marked } from 'marked';
import Header from '@/components/common/Header';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);


async function getPosts() {
  const blogDir = path.join(process.cwd(), 'blog');
  const filenames = await readdir(blogDir);

  const posts = await Promise.all(
    filenames.map(async (filename) => {
      const filePath = path.join(blogDir, filename);
      const fileContents = await readFile(filePath, 'utf8');
      const { data, content } = matter(fileContents);

      const slug = filename.replace(/\.md$/, '');

      let title = data.title;
      if (!title) {
        const titleMatch = content.match(/^#\s+(.*)/m);
        title = titleMatch ? titleMatch[1] : 'Untitled Post';
      }

      const htmlContent = marked(content);

      return {
        slug,
        title,
        date: new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        content: htmlContent,
      };
    })
  );

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export default async function Blog() {
  const posts = await getPosts();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      
      <main className="flex-1 pt-12 w-full px-4 lg:mx-auto lg:max-w-7xl">
        <section className="py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-12 text-center">Our Blog</h1>
          <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug} className="block group">
                <article className="bg-card border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                  <div className="p-6 flex-1">
                    <h2 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">{post.title}</h2>
                    <p className="text-sm text-muted-foreground mb-4">{post.date}</p>
                    <div className="prose dark:prose-invert max-w-none line-clamp-3" dangerouslySetInnerHTML={{ __html: post.content }} />
                  </div>
                  <div className="p-6 pt-0">
                    <span className="text-primary font-semibold flex items-center">Read More <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="w-full px-4 py-6 text-center text-muted-foreground lg:container lg:mx-auto">
          <p>&copy; {new Date().getFullYear()} ReadMore. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}
