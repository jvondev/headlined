"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface GreetingProps {
    onComplete?: () => void;
}

export const Greeting = ({ onComplete }: GreetingProps) => {
    const [greeting, setGreeting] = useState("");
    const [text, setText] = useState("");
    const [showCursor, setShowCursor] = useState(true);

    useEffect(() => {
        const date = new Date();
        const hour = date.getHours();
        let greet = "Good Evening";
        if (hour < 5) greet = "Good Night";
        else if (hour < 12) greet = "Good Morning";
        else if (hour < 18) greet = "Good Afternoon";

        const dateStr = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        setGreeting(`${greet}, it's ${dateStr}.`);
    }, []);

    useEffect(() => {
        if (!greeting) return;

        setText(""); // Reset text when greeting changes
        let i = 0;

        const timer = setInterval(() => {
            if (i < greeting.length) {
                // Use functional update to ensure we append to the latest state
                // and access the character at the current index 'i'
                const char = greeting.charAt(i);
                setText((prev) => prev + char);
                i++;
            } else {
                clearInterval(timer);
                if (onComplete) setTimeout(onComplete, 1000); // Wait a bit before triggering complete
            }
        }, 80); // Slightly faster typing

        return () => clearInterval(timer);
    }, [greeting]);

    return (
        <div className="flex items-center justify-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-headline text-foreground text-center">
                {text}
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                    className="inline-block w-[3px] h-[0.8em] bg-primary ml-1 align-middle rounded-full"
                />
            </h1>
        </div>
    );
};
