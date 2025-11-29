'use client';

import { useEffect } from 'react';
import { fetchAllPosts } from '@repo/lib/utils/client-posts';

export function BackgroundSyncProvider() {
  useEffect(() => {
    // Trigger the background sync when the component mounts
    fetchAllPosts();
  }, []);

  return null; // This component doesn't render anything visible
}
