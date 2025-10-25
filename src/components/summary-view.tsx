"use client";

import { FC } from "react";
import type { Summary } from "@/types";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DynamicIcon } from './dynamic-icon';
import { Quote as QuoteIcon } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useFullScreen } from "@/context/full-screen-context";

interface SummaryViewProps {
  summary: Summary;
}

export const SummaryView: FC<SummaryViewProps> = ({ summary }) => {
  const isMobile = useIsMobile();
  const { isFullScreen } = useFullScreen();

  const snippet = summary.content.snippet;
  const parts = snippet.split('. ');
  const sentence = parts[0] + (parts.length > 1 ? '.' : '');
  const subsentence = parts.slice(1).join('. ');

  const combinedTextLength = snippet.length;

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
    <div className="flex flex-col items-start justify-center text-left h-full p-8 md:p-12 max-w-2xl mx-auto">
      <QuoteIcon className={cn(quoteIconSizeClass, "text-muted-foreground/20", "mb-2")} />
      <h2 className="text-sm font-medium text-muted-foreground mt-0.5">Summary</h2>
      <blockquote className={cn("font-semibold leading-snug max-w-2xl", mainSentenceFontSizeClass)}>
        &ldquo;{sentence}&rdquo;
      </blockquote>
      {subsentence && (
        <p className={cn("mt-4 text-muted-foreground", subsentenceFontSizeClass)}>
          <span>&mdash; {subsentence}</span>
        </p>
      )}

      <div className={cn('flex-shrink-0 flex flex-row justify-start gap-2 pt-4 mb-12 sticky bottom-0 z-10 bg-background', { 'invisible': isFullScreen })}>
        <Link href={summary.content.originalArticleUrl} target='_blank' rel='noopener noreferrer' passHref>
          <Button variant='outline' className='truncate w-full md:w-auto'>
            <DynamicIcon name='ExternalLink' className='mr-2 h-4 w-4 flex-shrink-0' />
            <span className='truncate'>Read original article</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};