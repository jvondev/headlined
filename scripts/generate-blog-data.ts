
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const blogMarkdownDir = path.join(process.cwd(), 'blog');
const outputFilePath = path.join(process.cwd(), 'public/blogs.json');

interface PostData {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  image: string;
  tags: string[];
  htmlContent: string;
}

async function generateBlogData() {
  const allPosts: PostData[] = [];

  try {
    if (!fs.existsSync(blogMarkdownDir)) {
      console.warn(`Blog Markdown directory not found: ${blogMarkdownDir}. No blog data will be generated.`);
      return;
    }

    const filenames = await fs.promises.readdir(blogMarkdownDir);

    for (const filename of filenames) {
      if (filename.endsWith('.md')) {
        const slug = filename.replace(/\.md$/, '');
        const filePath = path.join(blogMarkdownDir, filename);
        const fileContents = await fs.promises.readFile(filePath, 'utf8');
        const { data, content } = matter(fileContents);

        const defaults = {
          title: 'Untitled Post',
          description: 'No description provided.',
          author: 'Anonymous',
          image: '/blog/images/default-banner.png',
          tags: [],
          date: new Date().toISOString(),
        };

        const htmlContent = marked.parse(content) as string;

        const postData: PostData = {
          slug,
          title: data.title || defaults.title,
          date: data.date ? new Date(data.date).toISOString() : defaults.date,
          description: data.description || defaults.description,
          author: data.author || defaults.author,
          image: data.image || defaults.image,
          tags: data.tags || defaults.tags,
          htmlContent,
        };

        allPosts.push(postData);
      }
    }
  } catch (error) {
    console.error("Error generating blog data:", error);
  }

  allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.writeFileSync(outputFilePath, JSON.stringify(allPosts, null, 2));

  console.log(`Successfully generated blogs.json with ${allPosts.length} posts.`);
}

generateBlogData();
