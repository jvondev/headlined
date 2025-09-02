
"use client";

import type { Insight, DeepDive, DeepDiveType, SavedItem, DeepDiveContent } from "@/types";
import { useEffect, type FC, useContext } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";
import { MoveRight, ChevronRight, Rss } from "lucide-react";
import { ChecklistView } from "@/components/deep-dive/checklist-view";
import { ComparisonView } from "@/components/deep-dive/comparison-view";
import { QnaView } from "@/components/deep-dive/qna-view";
import { QuoteView } from "@/components/deep-dive/quote-view";
import { HowToView } from "@/components/deep-dive/how-to-view";
import { CaseStudyView } from "@/components/deep-dive/case-study-view";
import { DataView } from "@/components/deep-dive/data-view";
import { MythView } from "@/components/deep-dive/myth-view";
import { AlternativesView } from "@/components/deep-dive/alternatives-view";
import { MetadataView } from "@/components/deep-dive/metadata-view";
import { DynamicIcon } from "@/components/dynamic-icon";
import { CarouselContext } from "@/context/carousel-context";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface InsightViewProps {
  insight: Insight;
  isActive: boolean;
  startOnDeepDive?: boolean;
  initialDeepDiveIndex?: number;
}


const DeepDiveContent: FC<{ deepDive: DeepDive<DeepDiveType> }> = ({ deepDive }) => {
    switch (deepDive.type) {
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
        case 'case-study':
            return <CaseStudyView {...(deepDive.content as DeepDiveContent['case-study'])} />;
        case 'data':
            return <DataView points={(deepDive.content as DeepDiveContent['data']).points} />;
        case 'myth':
            return <MythView {...(deepDive.content as DeepDiveContent['myth'])} />;
        case 'alternatives':
            return <AlternativesView points={(deepDive.content as DeepDiveContent['alternatives']).points} />;
        case 'metadata':
            return <MetadataView items={(deepDive.content as DeepDiveContent['metadata']).items} />;
        default:
            return <p>Unsupported deep dive type.</p>;
    }
};


export const InsightView: FC<InsightViewProps> = ({ insight, isActive, startOnDeepDive = false, initialDeepDiveIndex }) => {
  const { setHorizontalEmblaApi } = useContext(CarouselContext);
  const router = useRouter();
  
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
    if (!emblaApi) return;

    const handleSettle = () => {
        // The trigger is now the slide *after* the last deep dive
        if (emblaApi.selectedScrollSnap() === (insight.deepDives?.length || 0) + 1) {
            const isRss = insight.slug.startsWith('rss-');
            const blogPath = isRss ? `/blog/rss/${insight.slug.replace('rss-', '')}` : `/blog/${insight.slug}`;
            router.push(`${blogPath}?from=insight`);
        }
    }
    
    emblaApi.on('settle', handleSettle);
    
    if (setHorizontalEmblaApi && isActive) {
        setHorizontalEmblaApi(insight.slug, emblaApi);
    }

    return () => {
        emblaApi.off('settle', handleSettle);
    }
  }, [emblaApi, setHorizontalEmblaApi, insight, isActive, router]);
  

  return (
    <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="overflow-hidden h-full w-full" ref={emblaRef}>
            <div className="flex h-full">
                {/* Main Insight Card */}
                <div className="relative flex-[0_0_100%] bg-background text-foreground">
                    {insight.thumbnailUrl && (
                        <>
                            <Image
                                src={insight.thumbnailUrl}
                                alt={insight.headline}
                                fill
                                className="object-cover"
                                sizes="100vw"
                                priority
                            />
                            <div className="absolute inset-0 bg-black/60" />
                        </>
                    )}
                    <div className={cn(
                        "relative flex h-full flex-col justify-center items-center p-8 md:p-12 text-center z-10",
                        insight.thumbnailUrl && "text-white"
                    )}>
                        <div className="max-w-3xl">
                             <div className="flex justify-center gap-2 mb-2">
                                {(insight.category || []).slice(0,3).map((cat) => (
                                    <Link key={cat} href={`/category/${cat.toLowerCase().replace(/ /g, '-')}`}>
                                        <Badge variant={insight.thumbnailUrl ? 'secondary' : 'default'} className={cn(insight.thumbnailUrl && "bg-white/20 text-white border-none")}>{cat}</Badge>
                                    </Link>
                                ))}
                            </div>
                            <h1 className="font-headline text-4xl md:text-5xl font-bold mt-2">{insight.headline}</h1>
                            <p className={cn(
                                "mt-4 text-lg md:text-xl max-w-xl mx-auto",
                                insight.thumbnailUrl ? "text-white/80" : "text-muted-foreground"
                            )}>{insight.summary}</p>
                        </div>
                        <div className="absolute bottom-16 right-8 flex flex-col items-center gap-1 text-muted-foreground animate-bounce">
                           <span className={cn("text-xs", insight.thumbnailUrl && "text-white/70")}>Deep Dive</span>
                           <div className="flex items-center gap-2">
                               <ChevronRight className={cn("size-5", insight.thumbnailUrl && "text-white/70")} />
                               <button
                                   onClick={() => {
                                       const currentSubscribed = JSON.parse(localStorage.getItem("subscribedFeeds") || "[]");
                                       const isAlreadySubscribed = currentSubscribed.some((feed: any) => feed.id === insight.slug);
                                       if (!isAlreadySubscribed) {
                                           const newSubscribed = [...currentSubscribed, { id: insight.slug, name: insight.headline }];
                                           localStorage.setItem("subscribedFeeds", JSON.stringify(newSubscribed));
                                       }
                                   }}
                                   className={cn("p-2 rounded-full bg-white/20 text-white/70 hover:bg-white/30", insight.thumbnailUrl ? "" : "bg-gray-200 text-gray-700 hover:bg-gray-300")}
                               >
                                   <Rss className="size-5" />
                               </button>
                           </div>
                        </div>
                    </div>
                </div>

                {/* Deep Dive Cards */}
                {(insight.deepDives || []).map((deepDive, index) => {
                    return (
                        <div key={index} className="relative flex-[0_0_100%] deep-dive-card-wrapper">
                            <Card className="deep-dive-card pt-16">
                                <div className="border-b py-6 text-center">
                                    <div className="flex justify-center items-center gap-3">
                                        <DynamicIcon name={deepDive.icon} className="size-7 text-primary/70" />
                                        <h2 className="font-headline text-2xl">{deepDive.title}</h2>
                                    </div>
                                </div>
                                <div className="flex-1 px-4 md:px-8 py-8 overflow-y-auto deep-dive-scrollable-content no-scrollbar">
                                    <div className="w-full max-w-4xl mx-auto">
                                       <DeepDiveContent deepDive={deepDive} />
                                    </div>
                                </div>
                                 <div className="absolute bottom-16 right-8 flex flex-col items-center gap-1 text-muted-foreground/50 animate-bounce">
                                   <span className="text-xs">{index < (insight.deepDives?.length || 0) - 1 ? 'Next' : 'Full Story'}</span>
                                   <ChevronRight className="size-5" />
                                </div>
                            </Card>
                        </div>
                    )
                })}

                 {/* Full Story trigger card */}
                <div className="relative flex-[0_0_25%] bg-background">
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
