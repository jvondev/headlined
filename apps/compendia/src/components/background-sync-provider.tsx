'use client';

// Compendia doesn't need background sync of posts
// It fetches from OpenAlex API on-demand via client-openalex.ts
export function BackgroundSyncProvider() {
  return null;
}
