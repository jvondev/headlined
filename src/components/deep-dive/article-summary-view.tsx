'use client';

import { type FC, useMemo } from 'react';
import { ArticleSummaryContent } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DynamicIcon } from '../dynamic-icon';
import { Card, CardContent } from '@/components/ui/card'; // Import Card and CardContent
import { ScrollArea } from '@/components/ui/scroll-area'; // Import ScrollArea
import { useIsMobile } from '@/hooks/use-mobile'; // Import useIsMobile hook

interface ArticleSummaryViewProps {
  content: ArticleSummaryContent;
  blogContent: string;
  emblaApi: any;
}



export const ArticleSummaryView: FC<ArticleSummaryViewProps> = ({ content, blogContent, emblaApi }) => {
  const isMobile = useIsMobile(); // Use the hook to detect mobile

  const summarySnippet = useMemo(() => {
    if (!blogContent) {
      return []; // Return an empty array instead of an empty string
    }

    // Remove headings, horizontal rules, and blockquotes
    let plainText = blogContent
      .replace(/^#+\s.*$/gm, '') // Headings
      .replace(/^-{3,}$/gm, '') // Horizontal rules
      .replace(/^\s*>\s?/gm, ''); // Blockquotes

    // Remove images and links (keeping link text)
    plainText = plainText
      .replace(/!\[.*?\]\(.*?\)/g, '') // Images
      .replace(/\[(.*?)\]\(.*?\)/g, '$1'); // Links

    // Remove other markdown formatting (bold, italic, code)
    plainText = plainText.replace(/(\*\*|__|_|\*|`|~~)(.*?)\1/g, '$2');

    // Remove any remaining markdown-like characters and extra whitespace
    plainText = plainText.replace(/[#*_\-`~\[\]()<>]/g, '').replace(/\s+/g, ' ').trim();
    // Split into sentences.
    const sentences = plainText.match(/[^.!?]+[.!?]+/g) || [];
    
    let numSentencesToUse = 4; // Default for desktop

    // Calculate total character count of the potential sentences
    const potentialSummary = sentences.slice(0, 4).join(' ');
    const charCount = potentialSummary.length;

    if (isMobile) {
      // Mobile thresholds (more restrictive)
      if (charCount > 750) {
        numSentencesToUse = 1;
      } else if (charCount > 400) {
        numSentencesToUse = 2;
      } else {
        numSentencesToUse = 3; // Default for mobile if not very long
      }
    } else {
      // Desktop thresholds (less restrictive)
      if (charCount > 1200) {
        numSentencesToUse = 1;
      } else if (charCount > 900) {
        numSentencesToUse = 2;
      } else if (charCount > 500) {
        numSentencesToUse = 3;
      }
      // Default to 4 for desktop if not long enough for other thresholds
    }

    const slicedSentences = sentences.slice(0, numSentencesToUse);
    return slicedSentences;
  }, [blogContent, isMobile]); // Add isMobile to dependency array

  return (
    <div className='flex flex-col h-full px-2 md:p-4 pb-8'> {/* Reduced horizontal padding on mobile */}
      <ScrollArea className='flex-grow min-h-[100px]'> {/* ScrollArea takes available space, with a minimum height */} 
        {summarySnippet.map((sentence: string, index: number) => (
          <Card key={index} className='mb-4'> {/* Card component for each sentence with margin-bottom */}
            <CardContent className='p-4'> {/* CardContent with padding */}
              <p className='text-base md:text-xl text-muted-foreground text-left'> {/* Larger text on desktop */} 
                {sentence}
              </p>
            </CardContent>
          </Card>
        ))}
      </ScrollArea>
      
      <div className='flex-shrink-0 flex flex-row justify-center gap-2 pt-4 mb-12 sticky bottom-0 z-10 bg-background'> {/* Buttons sticky at the bottom, with background to cover content */} 
        <Link href={content.originalArticleUrl} target='_blank' rel='noopener noreferrer' passHref>
          <Button variant='outline' className='truncate w-full md:w-auto'> {/* Full width on mobile, auto on desktop */}
            <DynamicIcon name='ExternalLink' className='mr-2 h-4 w-4 flex-shrink-0' />
            <span className='truncate'>Read original article</span>
          </Button>
        </Link>
        <Button variant='default' onClick={() => emblaApi?.scrollNext()} className='truncate w-full md:w-auto'> {/* Full width on mobile, auto on desktop */}
          <span className='truncate'>Read more</span>
          <DynamicIcon name='ChevronRight' className='ml-2 h-4 w-4 flex-shrink-0' />
        </Button>
      </div>
    </div>
  );
};