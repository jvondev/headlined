'use client';

import { getAllPosts as fetchAllPosts } from './posts';
import type { Post } from '@/types';

// This is a client-side wrapper to fetch posts for the search index.
// It allows the useSearch hook to remain a client component while fetching
// data from a server component.
export const getAllPostsForSearch = async (): Promise<Post[]> => {
  return await fetchAllPosts();
};

export const getPreferences = () => {
  // Placeholder for preferences, will be implemented later
  return {};
};
