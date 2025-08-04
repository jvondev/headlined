
import { getAllInsights } from "@/lib/insights";
import { redirect } from "next/navigation";

type CategoryPageProps = {
    params: {
        category: string;
    }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const allInsights = await getAllInsights();
    const category = decodeURIComponent(params.category);

    const filteredInsights = allInsights.filter(insight => 
        insight.category.some(cat => cat.toLowerCase().replace(/ /g, '-') === category)
    );

    if (filteredInsights.length > 0) {
        // Redirect to the first insight of that category, but pass the category
        // so the carousel knows to filter.
        redirect(`/insight/${filteredInsights[0].slug}?category=${category}`);
    }

    // If no insights in that category, go to the main random insight page
    redirect('/');
}
