"use client";

import type { Insight, DeepDive, DeepDiveType, SavedItem, DeepDiveContent } from "@/types";
import { useEffect, type FC, useContext, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { MoveRight, ChevronRight, Rss } from "lucide-react";
import { useTheme } from "next-themes";
// DONT REMOVE IT
// import { ChecklistView } from "./deep-dive/checklist-view";
// import { ComparisonView } from "./deep-dive/comparison-view";
// import { QnaView } from "./deep-dive/qna-view";
// import { QuoteView } from "./deep-dive/quote-view";
// import { HowToView } from "./deep-dive/how-to-view";
// import { CaseStudyView } from "./deep-dive/case-study-view";
// import { DataView } from "./deep-dive/data-view";
// import { MythView } from "./deep-dive/myth-view";
// import { AlternativesView } from "./deep-dive/alternatives-view";
// import { MetadataView } from "./deep-dive/metadata-view";
import { ArticleSummaryView } from "./deep-dive/article-summary-view"; // Import new view
import { DynamicIcon } from "./dynamic-icon";
import { CarouselContext } from "@/context/carousel-context";
import { Card } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";

import { cn, splitIntoSubsentences } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface InsightViewProps {
  insight: Insight;
  isActive: boolean;
  startOnDeepDive?: boolean;
  initialDeepDiveIndex?: number;
}


const DeepDiveContent: FC<{ deepDive: any, emblaApi: any, insightAuthor?: string }> = ({ deepDive, emblaApi, insightAuthor }) => { // Added insightAuthor
    switch (deepDive.type) {
        // DONT REMOVE IT
        // case 'checklist':
        //     return <ChecklistView items={(deepDive.content as DeepDiveContent['checklist']).items} />;
        // case 'comparison':
        //     return <ComparisonView {...(deepDive.content as DeepDiveContent['comparison'])} />;
        // case 'qna':
        //     return <QnaView questions={(deepDive.content as DeepDiveContent['qna']).questions} />;
        // case 'quote':
        //     return <QuoteView {...(deepDive.content as DeepDiveContent['quote'])} />;
        // case 'howto':
        //     return <HowToView steps={(deepDive.content as DeepDiveContent['howto']).steps} />;
        // case 'case-study':
        //     return <CaseStudyView {...(deepDive.content as DeepDiveContent['case-study'])} />;
        // case 'data':
        //     return <DataView points={(deepDive.content as DeepDiveContent['data']).points} />;
        // case 'myth':
        //     return <MythView {...(deepDive.content as DeepDiveContent['myth'])} />;
        // case 'alternatives':
        //     return <AlternativesView points={(deepDive.content as DeepDiveContent['alternatives']).points} />;
        // case 'metadata':
        //     return <MetadataView items={(deepDive.content as DeepDiveContent['metadata']).items} />;
        case 'article-summary':
            return <ArticleSummaryView content={deepDive.content} sentence={deepDive.content.sentence} emblaApi={emblaApi} subsentences={insightAuthor ? splitIntoSubsentences(insightAuthor) : []} />; // Changed author to subsentences
        
        default:
            return <p>Unsupported deep dive type.</p>;
    }
};


export const InsightView: FC<InsightViewProps> = ({ insight, isActive, startOnDeepDive = false, initialDeepDiveIndex }) => {
  const { setHorizontalEmblaApi } = useContext(CarouselContext);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  const processedDeepDives = useMemo(() => {
    const newDeepDives: (DeepDive<DeepDiveType> & { content: { sentences?: string[] } })[] = [];

    if (insight.blogContent) {
        let plainText = insight.blogContent
          .replace(/^#+\s.*$/gm, '')
          .replace(/^-{3,}$/gm, '')
          .replace(/^\s*>\s?/gm, '');
        plainText = plainText
          .replace(/!\[.*?\]\(.*?\)/g, '')
          .replace(/\[(.*?)\]\(.*?\)/g, '$1');
        plainText = plainText.replace(/(\*\*|__|_|\*|`|~~)(.*?)\1/g, '$2');
        plainText = plainText.replace(/[#*_\-`~[\]()<>]/g, '').replace(/\s+/g, ' ').trim();
        const allSentences = (plainText.match(/[^.!?]+[.!?]+/g) || [])
          .filter(sentence => sentence.split(' ').length >= 6);

        // No need for sentences.slice(0,4) or summarySlides logic here.
        // We will create a deep dive for each sentence in allSentences.

        const totalWords = plainText.split(/\s+/).length; // Calculate total words

        let numSummarySentences = 3; // Minimum 3 sentences

        // Dynamic calculation based on totalWords
        if (totalWords > 300) {
            numSummarySentences = Math.min(allSentences.length, 3 + Math.floor((totalWords - 300) / 200));
            numSummarySentences = Math.min(numSummarySentences, 8); // Cap at 8 sentences
        }
        // Ensure we don't ask for more sentences than available
        numSummarySentences = Math.min(numSummarySentences, allSentences.length);

        const sentencesForSummary = allSentences.slice(0, numSummarySentences);

        if (sentencesForSummary.length > 0) { // Only proceed if there are sentences
            sentencesForSummary.forEach((sentence, sentenceIndex) => {
                const newContent = {
                    snippet: sentence.substring(0, 150) + '...',
                    slug: insight.slug,
                    originalArticleUrl: insight.slug.startsWith('rss-') ? `/blog/rss/${insight.slug.replace('rss-', '')}` : `/blog/${insight.slug}`,
                    sentence: sentence,
                };

                newDeepDives.push({
                    type: 'article-summary',
                    title: `Summary (${sentenceIndex + 1}/${sentencesForSummary.length})`, // Total based on sentencesForSummary
                    icon: 'BookText',
                    content: newContent,
                });
            });
        }
    }
    return newDeepDives;
  }, [insight.blogContent, isMobile, insight.slug]);
  
  const getStartIndex = () => {
    if (startOnDeepDive && typeof initialDeepDiveIndex === 'number' && initialDeepDiveIndex >= 0) {
        // The +1 accounts for the main insight card being at index 0
        return initialDeepDiveIndex + 1;
    }
    return 0;
  }
  
  const [emblaRef, emblaApi] = useEmblaCarousel({ 
    axis: "x", 
    skipSnaps: false, 
    slidesToScroll: 1,
    startIndex: getStartIndex(),
  }, [WheelGesturesPlugin({
    forceWheelAxis: 'x',
    wheelDraggingClass: 'is-wheel-dragging'
  })]);
  
  useEffect(() => {
    if (emblaApi && !isActive) {
      emblaApi.scrollTo(0, true); 
    }
  }, [isActive, emblaApi]);

  useEffect(() => {
    if (!emblaApi || !setHorizontalEmblaApi) return;
    
    // Register the API with the parent carousel
    const unregister = setHorizontalEmblaApi(insight.slug, emblaApi);

    const handleSettle = () => {
        // The trigger is now the slide *after* the last deep dive
        if (emblaApi.selectedScrollSnap() === processedDeepDives.length + 1) {
            const isRss = insight.slug.startsWith('rss-');
            const blogSlug = isRss ? insight.slug.replace('rss-', '') : insight.slug;
            const blogPath = isRss ? `/blog/rss/${blogSlug}` : `/blog/${blogSlug}`;
            router.push(`${blogPath}?from=insight&returnTo=${insight.slug}`);
        }
    }
    
    emblaApi.on('settle', handleSettle);
    
    return () => {
        if(emblaApi) {
            emblaApi.off('settle', handleSettle);
        }
        unregister();
    }
  }, [emblaApi, setHorizontalEmblaApi, insight, isActive, router, processedDeepDives.length]);
  

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="overflow-hidden h-full w-full" ref={emblaRef} role="region" aria-roledescription="carousel" aria-label="Deep Dives Carousel">
            <div className="flex h-full">
                {/* Main Insight Card */}
                <div className="relative flex-[0_0_100%] bg-background text-foreground" role="group" aria-roledescription="slide" aria-label="Main Insight">
                    {insight.thumbnailUrl && (
                        <>
                            <img
                                src={insight.thumbnailUrl}
                                alt={insight.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                loading="lazy"
                            />
                            <div className={cn("absolute inset-0", theme === 'light' ? 'bg-white/55' : 'bg-black/60')} />
                        </>
                    )}
                    <div className={cn(
                        "relative flex h-full flex-col justify-center items-center p-8 md:p-12 text-center z-10",
                        insight.thumbnailUrl && (theme === 'light' ? 'text-black' : 'text-white')
                    )}>
                        <div className="max-w-3xl">
                             <div className="flex flex-wrap justify-center gap-2 mb-2">
                                {(insight.category || []).slice(0,3).map((cat) => (
                                    // Add a check to ensure cat is a string
                                    typeof cat === 'string' && (
                                        <Link key={cat} href={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}>
                                            <Badge variant={insight.thumbnailUrl ? 'secondary' : 'default'} className={cn(insight.thumbnailUrl && (theme === 'light' ? 'bg-black/10 text-black border-none' : 'bg-white/20 text-white border-none'))}>{cat}</Badge>
                                        </Link>
                                    )
                                ))}
                            </div>
                            <h1 className="font-headline text-3xl md:text-5xl font-bold mt-2">{insight.title}</h1>
                            <p className={cn(
                                "mt-4 text-lg md:text-xl max-w-xl mx-auto",
                                insight.thumbnailUrl ? (theme === 'light' ? 'text-black/80' : 'text-white/80') : "text-muted-foreground"
                            )}>{insight.description}</p>
                        </div>
                        
                    </div>
                </div>

                {/* Deep Dive Cards */}
                {processedDeepDives.map((deepDive, index) => {
                    return (
                        <div key={index} className="relative flex-[0_0_100%] deep-dive-card-wrapper" role="group" aria-roledescription="slide" aria-label={`Deep Dive ${index + 1}: ${deepDive.title}`}>
                            <Card className="deep-dive-card">
                                <div className="border-b py-6 text-center">
                                    <div className="flex justify-center items-center gap-3">
                                        <DynamicIcon name={deepDive.icon} className="size-7 text-primary/70" />
                                        <h2 className="font-headline text-2xl">{deepDive.title}</h2>
                                    </div>
                                </div>
                                <div className="flex-1 mt-4 px-4 md:px-8">
                                    <div className="w-full max-w-4xl mx-auto h-full">
                                       <DeepDiveContent deepDive={deepDive} emblaApi={emblaApi} insightAuthor={insight.author} />
                                    </div>
                                </div>
                                 
                            </Card>
                        </div>
                    )
                })}

                 {/* Full Story trigger card */}
                <div className="relative flex-[0_0_25%] bg-background" role="group" aria-roledescription="slide" aria-label="Full Story Trigger">
                   <div className="flex h-full flex-col items-center justify-center text-center p-8">
                        <MoveRight className="size-8 text-muted-foreground/50" />
                        <p className="mt-4 text-lg text-muted-foreground">Opening full story...</p>
                   </div>
                </div>
            </div>
        </div>
    </div>
  );
};