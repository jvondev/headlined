"use client";

import * as React from 'react';
import { useState, type FC } from 'react';
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
    id: string;
    heading: string;
    level: number;
    content: string;
    children: MarkdownSection[]; // Added for nesting
}

// This function parses the markdown and splits it into sections based on headings
function parseMarkdownIntoSections(markdown: string): MarkdownSection[] {
    if (!markdown) return [];

    const lines = markdown.split('\n');
    const sections: MarkdownSection[] = [];
    const stack: MarkdownSection[] = []; // To keep track of parent sections
    let sectionCounter = 0; // Unique ID counter

    let currentContent = ''; // Accumulate content before a heading

    for (const line of lines) {
        const match = line.match(/^(#{1,4})\s+(.*)/); // Match h1, h2, h3, h4

        if (match) {
            // If there's accumulated content, add it to the current section's content
            if (currentContent.trim() !== '') {
                if (stack.length > 0) {
                    stack[stack.length - 1].content += currentContent;
                } else {
                    // This handles content before the very first heading
                    // For now, we'll assume initialContent handles this.
                    // If not, we might need a special "intro" section.
                }
                currentContent = ''; // Reset content
            }

            const newSection: MarkdownSection = {
                id: `section-${sectionCounter++}`,
                heading: match[2],
                level: match[1].length,
                content: '',
                children: [],
            };

            // Adjust the stack based on the new section's level
            while (stack.length > 0 && stack[stack.length - 1].level >= newSection.level) {
                stack.pop();
            }

            if (stack.length > 0) {
                stack[stack.length - 1].children.push(newSection);
            } else {
                sections.push(newSection);
            }
            stack.push(newSection);
        } else {
            // Accumulate content for the current section
            currentContent += line + '\n';
        }
    }

    // Add any remaining content to the last section
    if (currentContent.trim() !== '' && stack.length > 0) {
        stack[stack.length - 1].content += currentContent;
    }

    return sections;
}



const MarkdownRenderer: FC<MarkdownRendererProps> = ({ children, className, showAds = true }) => {
    const { theme } = useTheme();
    const [openSections, setOpenSections] = React.useState<Map<string, boolean>>(new Map());
    const [renderedSections, setRenderedSections] = React.useState<Set<string>>(new Set());
    const sectionRefs = React.useRef<Map<string, HTMLElement>>(new Map());

    const memoizedParsedContent = React.useMemo(() => {
        const hasHeadings = /^#+\s/m.test(children);
        const markdownContent = hasHeadings ? children : `## Summary\n\n${children}`;
        const sections = parseMarkdownIntoSections(markdownContent);
        const initialContent = markdownContent.split(/^(?:#{1,4}\s+.*)/m)[0];
        return { sections, initialContent, markdownContent };
    }, [children]);

    const { sections, initialContent, markdownContent } = memoizedParsedContent;

    const flattenSections = (sections: MarkdownSection[]): MarkdownSection[] => {
        let flat: MarkdownSection[] = [];
        sections.forEach(section => {
            flat.push(section);
            if (section.children.length > 0) {
                flat = flat.concat(flattenSections(section.children));
            }
        });
        return flat;
    };

    const allSections = flattenSections(sections);

    const [failedImageUrls, setFailedImageUrls] = React.useState<Set<string>>(new Set());

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
                const imageUrl = image.properties.src || '';

                if (failedImageUrls.has(imageUrl)) {
                    return null; // Don't render if image failed to load
                }

                return (
                     <div className="relative my-8 w-full aspect-video rounded-lg overflow-hidden not-prose">
                        <Image
                            src={imageUrl}
                            alt={image.properties.alt || 'Image from article'}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onError={() => {
                                console.log('Image failed to load:', imageUrl);
                                setFailedImageUrls(prev => new Set(prev).add(imageUrl));
                            }}
                        />
                    </div>
                );
            }
            return <p>{paragraph.children}</p>;
        },
    };

    // Ad is placed after initial content if there is any, otherwise it won't be shown
    // unless there are sections.
    const shouldShowAd = (initialContent.trim().length > 0 || sections.length > 0) && showAds;

    const handleOpenChange = (sectionToChange: MarkdownSection, isOpen: boolean) => {
        setOpenSections(prevOpenSections => {
            const newOpenSections = new Map(prevOpenSections);

            if (isOpen) {
                // Open all children recursively
                const openChildren = (section: MarkdownSection) => {
                    section.children.forEach(child => {
                        newOpenSections.set(child.id, true);
                        openChildren(child);
                    });
                };
                openChildren(sectionToChange);

                newOpenSections.set(sectionToChange.id, true);
                // Mark as rendered when opened
                setRenderedSections(prev => new Set(prev).add(sectionToChange.id));

                // Scroll to the newly opened heading
                const currentSectionElement = sectionRefs.current.get(sectionToChange.id);
                if (currentSectionElement) {
                    setTimeout(() => {
                        currentSectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 300); // Keep the timeout to allow animations to settle
                }
            } else {
                // Close the section and all its children recursively
                const closeChildren = (section: MarkdownSection) => {
                    section.children.forEach(child => {
                        newOpenSections.set(child.id, false);
                        closeChildren(child);
                    });
                };
                closeChildren(sectionToChange);
                newOpenSections.set(sectionToChange.id, false);
            }
            return newOpenSections;
        });
    };

    const renderSection = (section: MarkdownSection, index: number) => {
        const HeadingTag = `h${section.level}` as keyof JSX.IntrinsicElements;
        const isH1 = section.level === 1;
        const sectionKey = section.id;
        const triggerRef = React.useCallback((node: HTMLButtonElement) => {
            if (node) {
                sectionRefs.current.set(sectionKey, node);
            } else {
                sectionRefs.current.delete(sectionKey);
            }
        }, [sectionKey]);

        const contentRef = React.useRef<HTMLDivElement>(null);
        const hasBeenRendered = renderedSections.has(sectionKey);

        const handleSectionOpenChange = (isOpen: boolean) => {
            handleOpenChange(section, isOpen);
            if (isOpen) {
                // Use a timeout to allow the collapsible to start opening before scrolling
                setTimeout(() => {
                    const currentSectionElement = sectionRefs.current.get(sectionKey);
                    if (currentSectionElement) {
                        currentSectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 300); // Keep the timeout to allow animations to settle
            }
        };

        return (
            <div key={sectionKey} className="mb-4 rounded-lg border bg-card shadow-sm overflow-hidden">
                <Collapsible
                    open={openSections.get(sectionKey) || false}
                    onOpenChange={handleSectionOpenChange}
                    className="group"
                >
                <CollapsibleTrigger ref={triggerRef} className="flex items-center gap-2 w-full text-left p-4 bg-card-foreground/5 hover:bg-card-foreground/10 transition-colors duration-300">
                    <ChevronRight className="h-5 w-5 transition-transform duration-300 flex-shrink-0 group-data-[state=open]:rotate-90" />
                    {isH1 ? (
                        <HeadingTag className="text-3xl md:text-4xl font-extrabold text-primary-foreground">{section.heading}</HeadingTag>
                    ) : (
                        <span className={cn(
                            "font-bold",
                            section.level === 2 && "text-2xl md:text-3xl text-foreground",
                            section.level === 3 && "text-xl md:text-2xl text-muted-foreground",
                            section.level === 4 && "text-lg md:text-xl text-muted-foreground",
                        )}>
                            {section.heading}
                        </span>
                    )}
                </CollapsibleTrigger>
                <CollapsibleContent ref={contentRef} className="px-4 pb-4 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up overflow-hidden text-sm transition-all duration-300 ease-in-out opacity-0 data-[state=open]:opacity-100 data-[state=closed]:opacity-0">
                    {(openSections.get(sectionKey) || hasBeenRendered) && (
                        <>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>{section.content}</ReactMarkdown>
                            {section.children.map((childSection, childIndex) => renderSection(childSection, childIndex))}
                        </>
                    )}
                </CollapsibleContent>
            </Collapsible>
            </div>
        );
    };

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

        {/* Render all sections recursively */}
        {sections.map(renderSection)}
      </div>
    );
};

export default MarkdownRenderer;
