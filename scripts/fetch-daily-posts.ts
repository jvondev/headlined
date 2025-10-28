
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Define the Post type directly within this file
export interface Post {
  id: string; // Assuming 'id' is a string
  slug: string;
  title: string;
  description: string | null;
  link: string;
  thumbnail_url: string | null;
  topic: string | null;
  created_at: string;
  updated_at: string; // Assuming 'updated_at' is a string
}

// Minimal Database type definition for Supabase client
interface Database {
  public: {
    Tables: {
      posts: {
        Row: Post;
        Insert: Partial<Post>;
        Update: Partial<Post>;
      };
    };
  };
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase URL or Service Role Key');
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    persistSession: false,
  },
});

async function fetchDailyPosts() {
  console.log('Fetching daily posts...');

  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .gte('created_at', twentyFourHoursAgo);

  if (error) {
    console.error('Error fetching posts:', error);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log('No new posts in the last 24 hours.');
    process.exit(0);
  }

  const processedPosts = data.map((post: Post) => {
    const { id, created_at, updated_at, ...postWithoutUnusedFields } = post;
    return postWithoutUnusedFields;
  });

  const filePath = 'public/posts.json';
  try {
    fs.writeFileSync(filePath, JSON.stringify(processedPosts, null, 2));
    console.log(`Successfully wrote ${processedPosts.length} posts to ${filePath}`);
  } catch (writeError) {
    console.error(`Error writing to ${filePath}:`, writeError);
    process.exit(1);
  }

  process.exit(0);
}

fetchDailyPosts();
