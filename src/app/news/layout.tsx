import { ArticleModalProvider } from "@/context/article-modal-context";
import { ArticleModal } from "@/components/article-modal";

export default function NewsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ArticleModalProvider>
            {children}
            <ArticleModal />
        </ArticleModalProvider>
    );
}
