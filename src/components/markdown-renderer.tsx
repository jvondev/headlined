"use client";

import * as React from 'react';
import type { FC } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, vs } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useTheme } from 'next-themes';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { AdPlaceholder } from './ad-placeholder';

interface MarkdownRendererProps {
  children: string;
  className?: string;
  showAds?: boolean;
}

interface MarkdownSection {
    heading: string;
    level: number;
    content: string;
}

// This function parses the markdown and splits it into sections based on headings
function parseMarkdownIntoSections(markdown: string): MarkdownSection[] {
    if (!markdown) return [];
    
    const lines = markdown.split('\n');
    const sections: MarkdownSection[] = [];
    let currentSection: MarkdownSection | null = null;

    for (const line of lines) {
        const match = line.match(/^(#{1,4})\s+(.*)/); // Match h1, h2, h3, h4
        if (match) {
            // If there's an existing section, push it before starting a new one
            if (currentSection) {
                sections.push(currentSection);
            }
            currentSection = {
                heading: match[2],
                level: match[1].length,
                content: '',
            };
        } else if (currentSection) {
            currentSection.content += line + '\n';
        }
    }

    // Push the last section
    if (currentSection) {
        sections.push(currentSection);
    }
    
    return sections;
}


const MarkdownRenderer: FC<MarkdownRendererProps> = ({ children, className, showAds = true }) => {
    const { theme } = useTheme();

    // Check if there are any headings. If not, inject a default "Summary" h2 heading.
    const hasHeadings = /^#+\s/m.test(children);
    const markdownContent = hasHeadings ? children : `## Summary\n\n${children}`;
    
    const sections = parseMarkdownIntoSections(markdownContent);
    const initialContent = markdownContent.split(/^(?:#{1,4}\s+.*)/m)[0];

    const components = {
        code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const codeStyle = theme === 'dark' || theme === 'color' ? vscDarkPlus : vs;

            return !inline && match ? (
                <SyntaxHighlighter
                    style={codeStyle}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                >
                    {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
            ) : (
                <code className={className} {...props}>
                    {children}
                </code>
            );
        },
        p: (paragraph: { node?: any; children?: React.ReactNode }) => {
            const { node } = paragraph;
            if (node?.children[0]?.tagName === "img") {
                const image = node.children[0];
                return (
                     <div className="relative my-8 w-full aspect-video rounded-lg overflow-hidden not-prose">
                        <Image
                            src={image.properties.src || ''}
                            alt={image.properties.alt || 'Image from article'}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                );
            }
            return <p>{paragraph.children}</p>;
        },
    };

    const h1Sections = sections.filter(s => s.level === 1);
    const otherSections = sections.filter(s => s.level > 1);
    const shouldCollapseH1 = h1Sections.length > 1;

    // Ad is placed after initial content if there is any, otherwise it won't be shown
    // unless there are sections.
    const shouldShowAd = (initialContent.trim().length > 0 || sections.length > 0) && showAds;

    return (
      <div className={className}>
        {/* Render any content that appears before the first heading */}
        {initialContent && (
             <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{initialContent}</ReactMarkdown>
        )}

        {/* Inject ad after initial content block */}
        {shouldShowAd && (
            <div className="my-8 not-prose">
                <AdPlaceholder isCompact={true} />
            </div>
        )}

        {/* Handle H1 sections */}
        {h1Sections.map((section, index) => (
            shouldCollapseH1 ? (
                <Collapsible key={`h1-${index}`} defaultOpen={false} className="group border-b last:border-b-0">
                    <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-4">
                        <ChevronRight className="h-5 w-5 transition-transform duration-200 flex-shrink-0 group-data-[state=open]:rotate-90" />
                        <h1 className="text-4xl font-bold">{section.heading}</h1>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="prose-p:ml-7 prose-ul:ml-7 prose-ol:ml-7 prose-blockquote:ml-7 pb-4">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{section.content}</ReactMarkdown>
                    </CollapsibleContent>
                </Collapsible>
            ) : (
                <div key={`h1-${index}`}>
                    <h1 className="text-4xl font-bold mt-8 mb-4">{section.heading}</h1>
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{section.content}</ReactMarkdown>
                </div>
            )
        ))}

        {/* Render other collapsible sections (h2, h3, h4) */}
        {otherSections.map((section, index) => (
            <Collapsible key={`h-other-${index}`} defaultOpen={false} className="group border-b last:border-b-0">
                <CollapsibleTrigger className="flex items-center gap-2 w-full text-left py-4">
                    <ChevronRight className="h-5 w-5 transition-transform duration-200 flex-shrink-0 group-data-[state=open]:rotate-90" />
                     <span className={cn(
                        "font-bold",
                        section.level === 2 && "text-3xl",
                        section.level === 3 && "text-2xl",
                        section.level === 4 && "text-xl",
                    )}>
                        {section.heading}
                    </span>
                </CollapsibleTrigger>
                <CollapsibleContent className="prose-p:ml-7 prose-ul:ml-7 prose-ol:ml-7 prose-blockquote:ml-7 pb-4">
                     <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{section.content}</ReactMarkdown>
                </CollapsibleContent>
            </Collapsible>
        ))}
      </div>
    );
};

export default MarkdownRenderer;