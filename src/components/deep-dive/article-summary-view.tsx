'use client';

import { type FC, useMemo } from 'react';
import { ArticleSummaryContent } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DynamicIcon } from '../dynamic-icon';

interface ArticleSummaryViewProps {
  content: ArticleSummaryContent;
  blogContent: string;
  emblaApi: any;
}



export const ArticleSummaryView: FC<ArticleSummaryViewProps> = ({ content, blogContent, emblaApi }) => {
  const summarySnippet = useMemo(() => {
    if (!blogContent) {
      return '';
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
    
    // Join the first 4 sentences.
    return sentences.slice(0, 4).join(' ').trim();
  }, [blogContent]);

  return (
    <div className='flex flex-col h-full p-4'>
      <div className='flex-grow min-h-0 overflow-y-auto'>
        <p className='text-base md:text-lg text-muted-foreground text-left'>
          {summarySnippet}
        </p>
      </div>
      
      <div className='flex-shrink-0 flex flex-wrap justify-center gap-2 pt-4'>
        <Link href={content.originalArticleUrl} target='_blank' rel='noopener noreferrer' passHref>
          <Button variant='outline' className='truncate'>
            <DynamicIcon name='ExternalLink' className='mr-2 h-4 w-4 flex-shrink-0' />
            <span className='truncate'>Read original article</span>
          </Button>
        </Link>
        <Button variant='default' onClick={() => emblaApi?.scrollNext()} className='truncate'>
          <span className='truncate'>Read more</span>
          <DynamicIcon name='ChevronRight' className='ml-2 h-4 w-4 flex-shrink-0' />
        </Button>
      </div>
    </div>
  );
};
