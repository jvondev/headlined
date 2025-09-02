'use client';

import { type FC, useState } from 'react';
import { ArticleSummaryContent } from '@/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { DynamicIcon } from '../dynamic-icon';

interface ArticleSummaryViewProps {
  content: ArticleSummaryContent;
  emblaApi: any;
}



export const ArticleSummaryView: FC<ArticleSummaryViewProps> = ({ content, emblaApi }) => {

  return (
    <div className='flex flex-col items-center'>
      
      <div className='flex gap-2 mt-2'>
        <Link href={content.originalArticleUrl} target='_blank' rel='noopener noreferrer' passHref>
          <Button variant='outline'>
            <DynamicIcon name='ExternalLink' className='mr-2 h-4 w-4' />
            Read original article
          </Button>
        </Link>
        <Button variant='default' onClick={() => emblaApi?.scrollNext()}>
          Read more
          <DynamicIcon name='ChevronRight' className='ml-2 h-4 w-4' />
        </Button>
      </div>
    </div>
  );
};