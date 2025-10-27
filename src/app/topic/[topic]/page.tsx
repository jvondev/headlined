import { getPaginatedPosts } from "@/lib/posts";
import { redirect } from "next/navigation";

export const revalidate = 86400; // Revalidate every day

type TopicPageProps = {
    params: {
        topic: string;
    }
}



export default async function TopicPage({ params }: TopicPageProps) {
    const topic = decodeURIComponent(params.topic);
    // TODO: Fetch topic by category name to get the topic_id
    // const { posts } = await getPaginatedPosts({ page: 1, topic_id: ... });

    // if (posts.length > 0) {
    //     redirect(`/post/${posts[0].slug}?topic_id=${topic_id}`);
    // }

    redirect('/');
}