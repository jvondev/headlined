import { getPaginatedPosts } from "@/lib/posts";
import { serverSupabase } from "@/lib/server-supabase";
import { redirect } from "next/navigation";

export const revalidate = 86400; // Revalidate every day

type CategoryPageProps = {
    params: {
        category: string;
    }
}



export default async function CategoryPage({ params }: CategoryPageProps) {
    const category = decodeURIComponent(params.category);
    // TODO: Fetch topic by category name to get the topic_id
    // const { posts } = await getPaginatedPosts({ page: 1, topic_id: ... });

    // if (posts.length > 0) {
    //     redirect(`/post/${posts[0].slug}?topic_id=${topic_id}`);
    // }

    redirect('/');
}