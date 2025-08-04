
import { getPaginatedInsights, getAllInsights } from "@/lib/insights";
import { redirect } from "next/navigation";

export const revalidate = 3600; // Revalidate every hour

type CategoryPageProps = {
    params: {
        category: string;
    }
}

export async function generateStaticParams() {
  const allInsights = await getAllInsights();
  const categories = new Set<string>();
  allInsights.forEach(insight => {
    insight.category.forEach(cat => {
      categories.add(cat.toLowerCase().replace(/ /g, '-'));
    });
  });
  return Array.from(categories).map(category => ({
    category: category,
  }));
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
