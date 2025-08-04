import type { DeepDive, DeepDiveType, DeepDiveContent } from "@/types";
import { FC } from "react";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import { Checkbox } from "../ui/checkbox";

const TruncatedText: FC<{ text: string, length?: number }> = ({ text, length = 100 }) => {
    if (text.length <= length) return <>{text}</>;
    return <>{text.substring(0, length)}...</>;
}


export const DeepDivePreview: FC<{ deepDive: DeepDive<DeepDiveType> }> = ({ deepDive }) => {
    switch (deepDive.type) {
        case 'qna':
            const qnaContent = deepDive.content as DeepDiveContent['qna'];
            return (
                <div className="space-y-1 text-xs">
                    <p className="font-semibold leading-snug"><TruncatedText text={qnaContent.questions[0].q} length={80} /></p>
                    <p className="text-muted-foreground"><TruncatedText text={qnaContent.questions[0].a} length={120} /></p>
                </div>
            )
        case 'checklist':
            const checklistContent = deepDive.content as DeepDiveContent['checklist'];
            return (
                <ul className="space-y-1.5 text-xs">
                    {checklistContent.items.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-center gap-2">
                            <Checkbox checked={item.isDone} className="size-3" disabled />
                            <span className="flex-1 truncate">{item.text}</span>
                        </li>
                    ))}
                </ul>
            )
        case 'comparison':
            const comparisonContent = deepDive.content as DeepDiveContent['comparison'];
            return (
                <div className="space-y-1 text-xs">
                    <p className="font-semibold">{comparisonContent.titleA}</p>
                    <p className="text-center text-muted-foreground text-xs">vs</p>
                    <p className="font-semibold text-right">{comparisonContent.titleB}</p>
                </div>
            )
        case 'quote':
            const quoteContent = deepDive.content as DeepDiveContent['quote'];
            return (
                <blockquote className="text-center text-xs">
                    <p className="font-semibold leading-snug">&ldquo;<TruncatedText text={quoteContent.text} length={150} />&rdquo;</p>
                    <footer className="mt-1 text-xs text-muted-foreground">&mdash; {quoteContent.author}</footer>
                </blockquote>
            )
        case 'howto':
            const howtoContent = deepDive.content as DeepDiveContent['howto'];
             return (
                <ol className="space-y-1 text-xs">
                    {howtoContent.steps.slice(0, 3).map((step, i) => (
                        <li key={i} className="flex items-baseline gap-1.5">
                            <span className="text-xs font-bold">{i+1}.</span>
                            <span className="truncate">{step.title}</span>
                        </li>
                    ))}
                </ol>
            )
        case 'case-study':
            const caseStudyContent = deepDive.content as DeepDiveContent['case-study'];
            return (
                <div className="space-y-1 text-xs">
                    <p className="font-semibold uppercase text-xs text-muted-foreground">Problem</p>
                    <p className="leading-snug"><TruncatedText text={caseStudyContent.problem} /></p>
                </div>
            )
        case 'data':
            const dataContent = deepDive.content as DeepDiveContent['data'];
             return (
                <div className="text-center">
                    <p className="text-3xl font-bold font-headline text-primary">{dataContent.points[0].value}</p>
                    <p className="mt-1 text-xs text-muted-foreground leading-tight"><TruncatedText text={dataContent.points[0].label} length={60} /></p>
                </div>
            )
        case 'myth':
            const mythContent = deepDive.content as DeepDiveContent['myth'];
            return (
                <div className="space-y-2 text-xs">
                    <div className="flex items-start gap-2 text-destructive">
                        <ThumbsDown className="size-3 mt-0.5 flex-shrink-0" />
                        <p className="leading-snug"><TruncatedText text={mythContent.myth} /></p>
                    </div>
                     <div className="flex items-start gap-2 text-primary">
                        <ThumbsUp className="size-3 mt-0.5 flex-shrink-0" />
                        <p className="leading-snug"><TruncatedText text={mythContent.fact} /></p>
                    </div>
                </div>
            )
        case 'alternatives':
            const alternativesContent = deepDive.content as DeepDiveContent['alternatives'];
            return (
                <ul className="space-y-1 text-xs">
                    {alternativesContent.points.slice(0,2).map((alt, i) => (
                        <li key={i} className="font-semibold leading-snug truncate">{alt.name}</li>
                    ))}
                </ul>
            )
        case 'metadata':
            const metadataContent = deepDive.content as DeepDiveContent['metadata'];
             return (
                <ul className="space-y-1">
                    {metadataContent.items.slice(0,3).map((item, i) => (
                        <li key={i} className="flex justify-between text-xs">
                            <span className="font-semibold text-muted-foreground">{item.label}</span>
                            <span className="truncate ml-2">{item.value}</span>
                        </li>
                    ))}
                </ul>
            )
        default:
            return <p className="text-xs text-muted-foreground">Preview not available.</p>;
    }
};