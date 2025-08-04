
import { getPaginatedInsights } from "@/lib/insights";
import { redirect } from "next/navigation";

type CategoryPageProps = {
    params: {
        category: string;
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const category = decodeURIComponent(params.category);
    const { insights } = await getPaginatedInsights({ page: 1, category });

    if (insights.length > 0) {
        // Redirect to the first insight of that category, but pass the category
        // so the carousel knows to filter.
        redirect(`/insight/${insights[0].slug}?category=${category}`);
    }

    // If no insights in that category, go to the main random insight page
    redirect('/');
}
