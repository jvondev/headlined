"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface GreetingProps {
    onComplete?: () => void;
    title?: string;
    mainText?: string;
    subText?: string;
}

export const Greeting = ({ onComplete, title, mainText, subText }: GreetingProps) => {
    const [greeting, setGreeting] = useState("");
    const [dateStr, setDateStr] = useState("");
    const [text, setText] = useState("");
    const [showDate, setShowDate] = useState(false);

    useEffect(() => {
        const date = new Date();
        const hour = date.getHours();
        let greet = "Good Evening";
        if (mainText) {
            greet = mainText;
        } else if (title) {
            greet = title;
        } else {
            if (hour < 5) greet = "Good Night";
            else if (hour < 12) greet = "Good Morning";
            else if (hour < 18) greet = "Good Afternoon";
        }

        setGreeting(greet);
        if (subText) {
            setDateStr(subText);
        } else {
            setDateStr(date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }));
        }
    }, [title, mainText, subText]);

    const onCompleteRef = useRef(onComplete);

    useEffect(() => {
        onCompleteRef.current = onComplete;
    }, [onComplete]);

    useEffect(() => {
        if (!greeting) return;

        let currentIndex = 0;
        const targetText = greeting;
        setText(""); // Ensure clear start

        const timer = setInterval(() => {
            if (currentIndex < targetText.length) {
                setText(targetText.slice(0, currentIndex + 1));
                currentIndex++;
            } else {
                clearInterval(timer);
                setShowDate(true);
                if (onCompleteRef.current) setTimeout(onCompleteRef.current, 1500);
            }
        }, 80);

        return () => clearInterval(timer);
    }, [greeting]);

    return (
        <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight font-headline text-foreground">
                {text}
                {!showDate && (
                    <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                        className="inline-block w-[3px] h-[0.8em] bg-primary ml-1 align-middle rounded-full"
                    />
                )}
            </h1>
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: showDate ? 1 : 0, y: showDate ? 0 : 10 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg md:text-xl text-muted-foreground mt-2 font-medium"
            >
                {dateStr}
            </motion.p>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: showDate ? 1 : 0, y: showDate ? 0 : 10 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="mt-4 w-full max-w-md"
            >
            </motion.div>
        </div>
    );
};
