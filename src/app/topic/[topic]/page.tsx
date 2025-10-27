import { getPaginatedPosts } from "@/lib/posts";
import { redirect } from "next/navigation";
import { getAllTopics } from "@/data/topics"; // Import getAllTopics

export const revalidate = 86400; // Revalidate every day

type TopicPageProps = {
    params: {
        topic: string;
    }
}

export async function generateStaticParams() {
    const topics = await getAllTopics();
    return topics.map(topic => ({
        topic: topic.name, // Assuming topic.name is the slug
    }));
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