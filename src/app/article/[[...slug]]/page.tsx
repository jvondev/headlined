import NotFound from '@/app/not-found';

// Generate static params for export
export async function generateStaticParams() {
    // Dynamically import fs/path to ensure they are NOT bundled for the client
    const fsPromise = import('fs');
    const pathPromise = import('path');
    const [fs, path] = await Promise.all([fsPromise, pathPromise]);

    const params: { slug: string[] }[] = [];
    const processedSlugs = new Set<string>();

    // Helper to add post to params
    const addPost = (date: string, slug: string) => {
        const key = `${date}/${slug}`;
        if (!processedSlugs.has(key)) {
            params.push({ slug: [date, slug] });
            processedSlugs.add(key);
        }
    };

    // 1. Local Cache Source
    try {
        const CACHE_DIR = path.join(process.cwd(), 'src', 'data', 'static-cache');
        if (fs.existsSync(CACHE_DIR)) {
            const categories = fs.readdirSync(CACHE_DIR, { withFileTypes: true })
                .filter(d => d.isDirectory())
                .map(d => d.name);

            for (const category of categories) {
                const categoryDir = path.join(CACHE_DIR, category);
                const files = fs.readdirSync(categoryDir).filter(f => f.endsWith('.json'));

                for (const file of files) {
                    try {
                        const filePath = path.join(categoryDir, file);
                        const fileContent = fs.readFileSync(filePath, 'utf-8');
                        const data = JSON.parse(fileContent);
                        const posts = Array.isArray(data) ? data : [data];

                        for (const post of posts) {
                            if (!post || !post.slug) continue;
                            const postDate = post.created_at
                                ? new Date(post.created_at).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0];
                            addPost(postDate, post.slug);
                        }
                    } catch (e) { }
                }
            }
        }
    } catch (e) {
        console.error('Error reading local cache:', e);
    }

    // 2. Remote CDN Source (Fetch "Today" and "Yesterday" to ensure fresh routes exist)
    // This solves the issue where new articles aren't in local cache yet
    try {
        const CDN_BASE = 'https://cdn.jsdelivr.net/gh/xupgudxup/BUg-7d8-diua-sdadh89-/output';
        const today = new Date();
        const datesToCheck = [today];

        // Add yesterday
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        datesToCheck.push(yesterday);

        // Fetch parallel
        await Promise.all(datesToCheck.map(async (dateObj) => {
            const dateStr = dateObj.toISOString().split('T')[0];
            try {
                const res = await fetch(`${CDN_BASE}/${dateStr}.json`, { next: { revalidate: 60 } });
                if (res.ok) {
                    const posts = await res.json();
                    if (Array.isArray(posts)) {
                        posts.forEach(post => {
                            if (post?.slug) addPost(dateStr, post.slug);
                        });
                    }
                }
            } catch (e) {
                // Ignore fetch errors
            }
        }));
    } catch (e) {
        console.error('Error fetching remote params:', e);
    }

    return params;
}

export default function ArticlePage() {
    return <NotFound />;
}
