
import { createClient } from '@supabase/supabase-js';
import { Database } from '../src/types/supabase';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

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

  if (!data) {
    console.log('No new posts in the last 24 hours.');
    process.exit(0);
  }

  const filePath = 'public/posts.json';
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Successfully wrote ${data.length} posts to ${filePath}`);
  } catch (writeError) {
    console.error(`Error writing to ${filePath}:`, writeError);
    process.exit(1);
  }

  process.exit(0);
}

fetchDailyPosts();
