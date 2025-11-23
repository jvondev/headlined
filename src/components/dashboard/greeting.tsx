"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface GreetingProps {
    onComplete?: () => void;
    title?: string;
    mainText?: string;
    subText?: string;
    action?: React.ReactNode;
    isPaused?: boolean;
}

export const Greeting = ({ onComplete, title, mainText, subText, action, isPaused = false }: GreetingProps) => {
    const [greetingDisplay, setGreetingDisplay] = useState("");
    const [dateDisplay, setDateDisplay] = useState("");
    const [showAction, setShowAction] = useState(!!action);
    const [isBackspacing, setIsBackspacing] = useState(false);
    const [isGreetingTypingComplete, setIsGreetingTypingComplete] = useState(false);
    const [isDateTypingComplete, setIsDateTypingComplete] = useState(false);

    // Refs to track state for animation logic
    const actionRef = useRef(action);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);

    // Main Greeting Typing Logic
    useEffect(() => {
        if (isPaused) return;

        const targetGreeting = mainText || title || getTimeBasedGreeting();
        let currentIdx = 0;

        // If action is already present on mount (Dashboard mode), show full text immediately
        if (action) {
            setGreetingDisplay(targetGreeting);
            return;
        }

        const timer = setInterval(() => {
            if (currentIdx <= targetGreeting.length) {
                setGreetingDisplay(targetGreeting.slice(0, currentIdx));
                currentIdx++;
            } else {
                clearInterval(timer);
                setIsGreetingTypingComplete(true);
                // Start typing date after greeting
                typeDate();
            }
        }, 50);

        return () => clearInterval(timer);
    }, [mainText, title, isPaused]);

    // Date Typing Logic
    const typeDate = () => {
        const targetDate = subText || new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
        let currentIdx = 0;

        const timer = setInterval(() => {
            if (currentIdx <= targetDate.length) {
                setDateDisplay(targetDate.slice(0, currentIdx));
                currentIdx++;
            } else {
                clearInterval(timer);
                setIsDateTypingComplete(true);
                // Trigger completion to switch to dashboard mode
                if (onComplete) setTimeout(onComplete, 1000);
            }
        }, 50);
    };

    // Watch for action becoming available (Intro -> Dashboard transition)
    useEffect(() => {
        if (action && !actionRef.current) {
            // Action just appeared (transition)
            // Start backspacing date
            setIsBackspacing(true);
        }
        actionRef.current = action;
    }, [action]);

    // Backspacing Logic
    useEffect(() => {
        if (!isBackspacing) return;

        const timer = setInterval(() => {
            setDateDisplay(prev => {
                if (prev.length > 0) {
                    return prev.slice(0, -1);
                } else {
                    clearInterval(timer);
                    setIsBackspacing(false);
                    setShowAction(true);
                    return "";
                }
            });
        }, 30); // Fast backspace

        return () => clearInterval(timer);
    }, [isBackspacing]);

    function getTimeBasedGreeting() {
        const hour = new Date().getHours();
        if (hour < 5) return "Good Night";
        if (hour < 12) return "Good Morning";
        if (hour < 18) return "Good Afternoon";
        return "Good Evening";
    }

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-headline text-foreground min-h-[1.2em]">
                {greetingDisplay}
                {!action && !isBackspacing && !isGreetingTypingComplete && (
                    <span className="inline-block w-[3px] h-[0.8em] bg-primary ml-1 align-middle rounded-full animate-pulse" />
                )}
            </h1>

            <div className="mt-2 h-8 flex items-center justify-center relative">
                {/* Date Text (Types in, then backspaces) */}
                {!showAction && (
                    <p className="text-lg md:text-xl text-muted-foreground font-medium">
                        {dateDisplay}
                        {isGreetingTypingComplete && !isBackspacing && !isDateTypingComplete && (
                            <span className="inline-block w-[2px] h-[0.8em] bg-primary/50 ml-1 align-middle rounded-full animate-pulse" />
                        )}
                        {isBackspacing && (
                            <span className="inline-block w-[2px] h-[0.8em] bg-primary ml-1 align-middle rounded-full" />
                        )}
                    </p>
                )}

                {/* Action/Dropdown (Reveals like typing) */}
                {showAction && action && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: "auto", opacity: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="overflow-hidden whitespace-nowrap"
                    >
                        {action}
                    </motion.div>
                )}
            </div>
        </div>
    );
};
