
import { Quote as QuoteIcon } from "lucide-react";
import type { FC } from "react";

interface QuoteViewProps {
  text: string;
  author: string;
}

export const QuoteView: FC<QuoteViewProps> = ({ text, author }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-4">
      <QuoteIcon className="size-12 text-muted-foreground/20" />
      <blockquote className="mt-6 text-2xl md:text-3xl font-semibold leading-snug max-w-2xl">
        &ldquo;{text}&rdquo;
      </blockquote>
      <p className="mt-4 text-lg text-muted-foreground">&mdash; {author}</p>
    </div>
  );
};
