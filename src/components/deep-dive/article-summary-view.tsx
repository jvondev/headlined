'use client';

import { type FC } from 'react';
import { ArticleSummaryContent } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DynamicIcon } from '../dynamic-icon';
import { Quote as QuoteIcon } from "lucide-react"; // Import QuoteIcon

interface ArticleSummaryViewProps {
  content: ArticleSummaryContent;
  emblaApi: any;
  sentence: string;
  subsentences?: string[]; // Changed to subsentences array
}

export const ArticleSummaryView: FC<ArticleSummaryViewProps> = ({ content, emblaApi, sentence, subsentences }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-4"> {/* Adjusted layout */}
      <QuoteIcon className="size-12 text-muted-foreground/20" /> {/* Added QuoteIcon */}
      <blockquote className="mt-6 text-2xl md:text-3xl font-semibold leading-snug max-w-2xl"> {/* Adjusted class names and tag */}
        &ldquo;{sentence}&rdquo; {/* Wrapped sentence in quotes */}
      </blockquote>
      {subsentences && subsentences.length > 0 && ( // Conditionally render subsentences
        <p className="mt-4 text-lg text-muted-foreground"> {/* Changed div to p */}
          {subsentences.map((sub, index) => (
            <span key={index}>&mdash; {sub}</span> // Wrapped in span to avoid extra p tags
          ))}
        </p>
      )}
      
      <div className='flex-shrink-0 flex flex-row justify-center gap-2 pt-4 mb-12 sticky bottom-0 z-10 bg-background'>
        <Link href={content.originalArticleUrl} target='_blank' rel='noopener noreferrer' passHref>
          <Button variant='outline' className='truncate w-full md:w-auto'>
            <DynamicIcon name='ExternalLink' className='mr-2 h-4 w-4 flex-shrink-0' />
            <span className='truncate'>Read original article</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};