"use client";

import type { Insight, DeepDive, DeepDiveType, SavedItem, DeepDiveContent } from "@/types";
import { useEffect, type FC, useContext, useMemo } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { MoveRight, ChevronRight, Rss, ArrowDown } from "lucide-react";
import { useTheme } from "next-themes";
// DONT REMOVE IT
import { ChecklistView } from "./deep-dive/checklist-view";
import { ComparisonView } from "./deep-dive/comparison-view";
import { QnaView } from "./deep-dive/qna-view";
import { QuoteView } from "./deep-dive/quote-view";
import { HowToView } from "./deep-dive/how-to-view";
// import { CaseStudyView } from "./deep-dive/case-study-view";
import { DataView } from "./deep-dive/data-view";
// import { MythView } from "./deep-dive/myth-view";
import { AlternativesView } from "./deep-dive/alternatives-view";
// import { MetadataView } from "./deep-dive/metadata-view";
import { ArticleSummaryView } from "./deep-dive/article-summary-view"; // Import new view
import { DynamicIcon } from "./dynamic-icon";
import { CarouselContext } from "@/context/carousel-context";
import { Card } from "./ui/card";
import Link from "next/link";
import { Badge } from "./ui/badge";

import { cn, splitIntoSubsentences, truncateWords } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface InsightViewProps {
  insight: Insight;
  isActive: boolean;
  startOnDeepDive?: boolean;
  initialDeepDiveIndex?: number;
}


const DeepDiveContent: FC<{ deepDive: any, emblaApi: any, insight: Insight }> = ({ deepDive, emblaApi, insight }) => {
    switch (deepDive.type) {
        // DONT REMOVE IT
        case 'checklist':
            return <ChecklistView items={(deepDive.content as DeepDiveContent['checklist']).items} />;
        case 'comparison':
            return <ComparisonView {...(deepDive.content as DeepDiveContent['comparison'])} />;
        case 'qna':
            return <QnaView questions={(deepDive.content as DeepDiveContent['qna']).questions} />;
        case 'quote':
            return <QuoteView {...(deepDive.content as DeepDiveContent['quote'])} />;
        case 'howto':
            return <HowToView steps={(deepDive.content as DeepDiveContent['howto']).steps} />;
        // case 'case-study':
        //     return <CaseStudyView {...(deepDive.content as DeepDiveContent['case-study'])} />;
        case 'data':
            return <DataView points={(deepDive.content as DeepDiveContent['data']).points} />;
        // case 'myth':
        //     return <MythView {...(deepDive.content as DeepDiveContent['myth'])} />;
        case 'alternatives':
            return <AlternativesView points={(deepDive.content as DeepDiveContent['alternatives']).points} />;
        // case 'metadata':
        //     return <MetadataView items={(deepDive.content as DeepDiveContent['metadata']).items} />;
        case 'article-summary':
            let sentenceToProcess = deepDive.content.sentence;

            // Phrases to remove from the beginning of the sentence, case-insensitively
            const phrasesToRemove = ["image credits:", "watch:"];
            // Add insight.author to phrasesToRemove if it exists
            if (insight.author) {
              phrasesToRemove.push(insight.author + ":"); // Assuming author is followed by a colon
              phrasesToRemove.push(insight.author); // Also add without colon
            }
            let removedSomethingInThisIteration = true;
            while (removedSomethingInThisIteration) {
              removedSomethingInThisIteration = false;
              for (const phrase of phrasesToRemove) {
                if (sentenceToProcess.toLowerCase().startsWith(phrase.toLowerCase())) {
                  sentenceToProcess = sentenceToProcess.substring(phrase.length).trim();
                  removedSomethingInThisIteration = true;
                  break; // Break from inner for loop to re-check from the beginning of phrasesToRemove
                }
              }
            }

            const { mainSentence, subsentence } = sentenceToProcess ? splitIntoSubsentences(sentenceToProcess) : { mainSentence: '', subsentence: undefined };
            
            return <ArticleSummaryView content={deepDive.content} sentence={mainSentence} emblaApi={emblaApi} subsentence={subsentence} />; // Changed to subsentence
        
        default:
            return <p>Unsupported deep dive type.</p>;
    }
};


export const InsightView: FC<InsightViewProps> = ({ insight, isActive, startOnDeepDive = false, initialDeepDiveIndex }) => {
  const { setHorizontalEmblaApi, triggerParentScrollDown } = useContext(CarouselContext);
  const router = useRouter();
  const isMobile = useIsMobile();
  const { theme } = useTheme();
  
  const processedDeepDives = useMemo(() => {
    // If insight already has deepDives, use them directly
    if (insight.deepDives && insight.deepDives.length > 0) {
      return insight.deepDives;
    }

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
        // Remove specific metadata patterns like "In Brief Posted: ..."
        plainText = plainText.replace(/In Brief Posted:.*?\d{1,2}:\d{2}\s(?:AM|PM)\s[A-Z]{3}\s·\s(?:January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}/g, '');
        let allSentences = (plainText.match(/[^.!?]+[.!?]+/g) || [])
          .filter(sentence => sentence.split(' ').length >= 5);

        // Heuristic to remove potential image captions that are not part of alt text
        const CAPTION_KEYWORDS = ["figure", "image", "photo", "source", "credit"];
        const MAX_CAPTION_WORDS = 15; // Max words for a potential caption

        allSentences = allSentences.filter(sentence => {
            const lowerCaseSentence = sentence.toLowerCase();
            const wordCount = sentence.split(' ').length;
            const containsKeyword = CAPTION_KEYWORDS.some(keyword => lowerCaseSentence.includes(keyword));

            // If it's short and contains a keyword, it's likely a caption
            if (wordCount <= MAX_CAPTION_WORDS && containsKeyword) {
                return false; // Exclude this sentence
            }
            return true; // Keep the sentence
        });

        const MIN_SENTENCE_WORDS_FOR_STANDALONE = 10; // Define threshold for short sentences

        // Merge short sentences with the next one
        const mergedSentences: string[] = [];
        for (let i = 0; i < allSentences.length; i++) {
            const currentSentence = allSentences[i];
            if (currentSentence.split(' ').length < MIN_SENTENCE_WORDS_FOR_STANDALONE && i + 1 < allSentences.length) {
                // Merge current short sentence with the next one
                mergedSentences.push(currentSentence.trim() + " " + allSentences[i + 1].trim());
                i++; // Skip the next sentence as it has been merged
            } else {
                mergedSentences.push(currentSentence.trim());
            }
        }
        allSentences = mergedSentences; // Update allSentences with the merged list

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
  }, [insight.blogContent, insight.deepDives, isMobile, insight.slug]);
  
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
            if (insight.slug === "home") {
                if (triggerParentScrollDown) {
                    triggerParentScrollDown();
                }
                return; // Do not navigate to full story for homepage insight
            }
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
                        "relative flex h-full flex-col justify-center items-center p-8 md:p-12 text-left z-10",
                        insight.thumbnailUrl && (theme === 'light' ? 'text-black' : 'text-white')
                    )}>
                        <div className="max-w-3xl">
                             <div className="flex flex-wrap justify-start gap-2 mb-2">
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
                                "mt-4 text-lg md:text-xl max-w-xl",
                                insight.thumbnailUrl ? (theme === 'light' ? 'text-black/80' : 'text-white/80') : "text-muted-foreground"
                            )}>{truncateWords(insight.description, 8)}</p>
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
                                <div className="flex-1 mt-4 md:px-8">
                                    <div className="w-full max-w-4xl h-full mx-auto">
                                       <DeepDiveContent deepDive={deepDive} emblaApi={emblaApi} insight={insight} />
                                    </div>
                                </div>
                                 
                            </Card>
                        </div>
                    )
                })}

                 {/* Full Story trigger card */}
                <div className="relative flex-[0_0_25%] bg-background" role="group" aria-roledescription="slide" aria-label="Full Story Trigger">
                   <div className="flex h-full flex-col items-center justify-center text-center p-8">
                        {insight.slug === "home" ? (
                            <ArrowDown className="size-8 text-muted-foreground/50" />
                        ) : (
                            <MoveRight className="size-8 text-muted-foreground/50" />
                        )}
                        <p className="mt-4 text-lg text-muted-foreground">{insight.slug === "home" ? "Read More" : "Opening full story..."}</p>
                   </div>
                </div>
            </div>
        </div>
    </div>
  );
};