'use client';

import { type FC } from 'react';
import { ArticleSummaryContent } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DynamicIcon } from '../dynamic-icon';
import { Quote as QuoteIcon } from "lucide-react"; // Import QuoteIcon
import { useIsMobile } from "@/hooks/use-mobile"; // Import useIsMobile
import { cn } from "@/lib/utils"; // Import cn

interface ArticleSummaryViewProps {
  content: ArticleSummaryContent;
  emblaApi: any;
  sentence: string;
  subsentence?: string; // Changed to single subsentence string
}

export const ArticleSummaryView: FC<ArticleSummaryViewProps> = ({ content, emblaApi, sentence, subsentence }) => {
  const isMobile = useIsMobile();
  const combinedTextLength = (sentence + (subsentence || '')).length;

  // Determine font size class for main sentence (blockquote)
  const mainSentenceFontSizeClass = isMobile 
    ? combinedTextLength < 100 
      ? 'text-3xl' 
      : combinedTextLength < 200 
        ? 'text-2xl' 
        : 'text-xl'
    : 'text-3xl md:text-4xl'; // Adjusted for desktop

  // Determine font size class for subsentence (p)
  const subsentenceFontSizeClass = isMobile 
    ? combinedTextLength < 100 
      ? 'text-xl' 
      : combinedTextLength < 200 
        ? 'text-lg' 
        : 'text-base'
    : 'text-xl'; // Adjusted for desktop

  // Determine QuoteIcon size class
  const quoteIconSizeClass = isMobile
    ? combinedTextLength < 100 
      ? 'size-12' 
      : combinedTextLength < 200 
        ? 'size-10' 
        : 'size-8'
    : 'size-12'; // Fixed size for desktop

  return (
    <div className="flex flex-col items-center justify-center text-center h-full p-4"> {/* Adjusted layout */}
      <QuoteIcon className={cn(quoteIconSizeClass, "text-muted-foreground/20")} /> {/* Apply dynamic size */}
      <blockquote className={cn("mt-6 font-semibold leading-snug max-w-2xl", mainSentenceFontSizeClass)}> {/* Apply dynamic font size */}
        &ldquo;{sentence}&rdquo; {/* Wrapped sentence in quotes */}
      </blockquote>
      {subsentence && (
        <p className={cn("mt-4 text-muted-foreground", subsentenceFontSizeClass)}> {/* Apply dynamic font size */}
          <span>&mdash; {subsentence}</span>
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