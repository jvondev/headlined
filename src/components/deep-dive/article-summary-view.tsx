'use client';

import { type FC } from 'react';
import { ArticleSummaryContent } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DynamicIcon } from '../dynamic-icon';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface ArticleSummaryViewProps {
  content: ArticleSummaryContent;
  emblaApi: any;
  sentences: string[];
}

export const ArticleSummaryView: FC<ArticleSummaryViewProps> = ({ content, emblaApi, sentences }) => {
  return (
    <div className='flex flex-col h-full px-2 md:p-4 pb-8'>
      <ScrollArea className='flex-grow min-h-[100px]'>
        {(sentences || []).map((sentence: string, index: number) => (
          <div key={index}>
            <p className='text-base md:text-xl text-foreground text-left py-2'>
              {sentence}
            </p>
            {index < sentences.length && <Separator className="mb-8 mt-2" />}
          </div>
        ))}
      </ScrollArea>
      
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