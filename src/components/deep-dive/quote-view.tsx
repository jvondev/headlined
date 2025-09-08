
import { Quote as QuoteIcon } from "lucide-react";
import type { FC } from "react";

interface QuoteViewProps {
  text: string;
  author: string;
}

export const QuoteView: FC<QuoteViewProps> = ({ text, author }) => {
  return (
    <div className="flex flex-col items-start justify-center text-left h-full p-8 md:p-12 max-w-2xl mx-auto">
      <QuoteIcon className="size-12 text-muted-foreground/20" />
      <blockquote className="mt-6 text-2xl md:text-3xl font-semibold leading-snug max-w-2xl">
        &ldquo;{text}&rdquo;
      </blockquote>
      <p className="mt-4 text-lg text-muted-foreground">&mdash; {author}</p>
    </div>
  );
};
