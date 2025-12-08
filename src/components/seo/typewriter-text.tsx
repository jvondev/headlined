"use client";

import { useState, useEffect, useRef } from 'react';

interface TypewriterTextProps {
    text: string;
    delay?: number; // Delay before starting
    speed?: number; // Base typing speed in ms
    className?: string;
    onComplete?: () => void;
    as?: 'h1' | 'h2' | 'p' | 'span';
}

export function TypewriterText({
    text,
    delay = 0,
    speed = 30,
    className = '',
    onComplete,
    as: Component = 'span'
}: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);
    const [hasStarted, setHasStarted] = useState(false);
    const hasCompleted = useRef(false);

    useEffect(() => {
        // Reset on text change
        setDisplayedText("");
        setCurrentIndex(0);
        setHasStarted(false);
        hasCompleted.current = false;

        // Start after delay
        const startTimer = setTimeout(() => {
            setHasStarted(true);
        }, delay);

        return () => clearTimeout(startTimer);
    }, [text, delay]);

    useEffect(() => {
        if (!hasStarted) return;

        if (currentIndex < text.length) {
            // Variable speed: faster as we go
            const progress = currentIndex / text.length;
            const dynamicSpeed = Math.max(5, speed * (1 - progress * 0.7));

            const timer = setTimeout(() => {
                setDisplayedText(text.substring(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, dynamicSpeed);

            return () => clearTimeout(timer);
        } else if (currentIndex === text.length && !hasCompleted.current) {
            hasCompleted.current = true;
            onComplete?.();
        }
    }, [currentIndex, text, speed, hasStarted, onComplete]);

    return (
        <Component className={className}>
            {displayedText}
            {currentIndex < text.length && hasStarted && (
                <span className="inline-block w-[2px] h-[0.8em] ml-0.5 bg-current animate-pulse align-middle" />
            )}
        </Component>
    );
}
