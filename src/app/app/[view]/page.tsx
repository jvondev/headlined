import { redirect } from 'next/navigation';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ view: string }>
};

const validViews = ['today', 'yesterday', 'archive', 'this-week', 'this-month', 'saved', 'search'];

export function generateStaticParams() {
    return validViews.map(view => ({ view }));
}

// Redirect old /app/[view] routes to new root-level routes
export default async function LegacyAppViewPage({ params }: Props) {
    const { view } = await params;

    if (validViews.includes(view)) {
        redirect(`/${view}`);
    }

    notFound();
}
