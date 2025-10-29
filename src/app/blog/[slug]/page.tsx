
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { promisify } from 'util';
import { marked } from 'marked';
import Header from '@/components/common/Header';

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);


async function getAllPostsData() {
  const blogDir = path.join(process.cwd(), 'blog');
  const filenames = await readdir(blogDir);

  return Promise.all(
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
        date: data.date,
        content: htmlContent,
      };
    })
  );
}

async function getPost(slug: string) {
  const posts = await getAllPostsData();
  return posts.find(post => post.slug === slug);
}

export default async function Post({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);

  if (!post) {
    // Handle post not found, e.g., redirect to 404 or blog list
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
        <Header />
        <main className="flex-1 pt-12 w-full px-4 lg:mx-auto lg:max-w-7xl">
          <article className="py-20 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4">Post Not Found</h1>
            <p className="text-lg text-muted-foreground">The blog post you are looking for does not exist.</p>
          </article>
        </main>
        <footer className="border-t">
          <div className="w-full px-4 py-6 text-center text-muted-foreground lg:container lg:mx-auto">
            <p>&copy; {new Date().getFullYear()} ReadMore. All Rights Reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground font-body">
      <Header />
      
      <main className="flex-1 pt-12 w-full px-4 lg:mx-auto lg:max-w-7xl">
        <article className="py-20">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-center">{post.title}</h1>
          <p className="text-center text-sm text-muted-foreground mb-12">
            {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <div className="prose dark:prose-invert lg:prose-xl mx-auto" dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>
      </main>

      <footer className="border-t">
        <div className="w-full px-4 py-6 text-center text-muted-foreground lg:container lg:mx-auto">
          <p>&copy; {new Date().getFullYear()} ReadMore. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export async function generateStaticParams() {
    const posts = await getAllPostsData();
    return posts.map((post) => ({
        slug: post.slug,
    }));
}
