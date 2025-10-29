
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked';

const blogMarkdownDir = path.join(process.cwd(), 'public/blog');
const blogOutputDir = path.join(process.cwd(), 'public/blog'); // Output JSONs to the same public/blog directory

interface PostMetadata {
  slug: string;
  title: string;
  date: string;
  description: string;
  author: string;
  image: string;
  tags: string[];
}

interface PostData extends PostMetadata {
  htmlContent: string;
}

async function generateBlogData() {
  // Ensure output directory exists
  if (!fs.existsSync(blogOutputDir)) {
    fs.mkdirSync(blogOutputDir, { recursive: true });
  }

  let allPostsMetadata: PostMetadata[] = [];

  try {
    // Ensure blog Markdown directory exists
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

        // Provide sensible defaults for missing frontmatter
        const defaults = {
          title: 'Untitled Post',
          description: 'No description provided.',
          author: 'Anonymous',
          image: '/blog/images/default-banner.png', // A default banner image
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
          htmlContent, // Include the full HTML content for individual post pages
        };

        // Save individual post JSON
        fs.writeFileSync(
          path.join(blogOutputDir, `${slug}.json`),
          JSON.stringify(postData, null, 2)
        );

        // Collect metadata for the index file (excluding htmlContent)
        const { htmlContent: _, ...metadata } = postData; // Destructure to omit htmlContent
        allPostsMetadata.push(metadata);
      }
    }
  } catch (error) {
    console.error("Error generating blog data:", error);
    // Continue even if there's an error, to at least try to write the index if some posts were processed
  }

  // Sort posts by date, newest first, for the index file
  allPostsMetadata.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Save the master blog index JSON
  fs.writeFileSync(
    path.join(blogOutputDir, 'blog-index.json'),
    JSON.stringify(allPostsMetadata, null, 2)
  );

  console.log('Successfully generated blog-index.json and individual post JSONs.');
}

generateBlogData();
