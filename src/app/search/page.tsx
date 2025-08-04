
import { redirect } from "next/navigation";

// This page redirects to the homepage if someone lands here without a query.
// The actual search results are handled by /search/[query]
export default async function SearchPage() {
    redirect('/');
}

// Make sure the page is dynamically rendered
export const dynamic = 'force-dynamic';
