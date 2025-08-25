// src/components/onboarding/onboarding-flow.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowLeft, X } from "lucide-react";
import { useOnboardingContext } from "@/context/onboarding-context"; // Import the context

interface OnboardingFlowProps {
  onComplete: () => void;
}

const steps = [
  {
    id: "welcome",
    title: "Welcome to ReadMore!",
    description: "Here’s a quick guide to get you started.",
    action: null,
    delay: 1500,
  },
  {
    id: "next-insight",
    title: "Discover New Insights",
    description: "Swipe up to see your next insight.",
    action: "scrollDown",
    delay: 2000,
  },
  {
    id: "deep-dive",
    title: "Explore Deeper",
    description: "Swipe left to explore more details.",
    action: "scrollRight",
    delay: 2000,
  },
  {
    id: "full-article",
    title: "Read the Full Article",
    description: "Keep swiping left to open the full article.",
    action: "scrollRight",
    delay: 2000,
  },
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isBlocked, setIsBlocked] = useState(true); // New state for blocking touch
  const { triggerScrollDown, triggerScrollRight, setOnboardingActive, isEmblaApiReady } = useOnboardingContext();
  const currentStep = steps[currentStepIndex];

  const handleAdvanceStep = useCallback(() => {

    // Trigger movement before advancing the step
    if (currentStep.action === "scrollDown") {
      triggerScrollDown();
    } else if (currentStep.action === "scrollRight") {
      triggerScrollRight();
    }

    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      setOnboardingActive(false); // Re-enable user input
      onComplete();
    }
  }, [currentStepIndex, steps.length, onComplete, setOnboardingActive, currentStep.action, triggerScrollDown, triggerScrollRight]);

  useEffect(() => {
    if (!isEmblaApiReady) return; // Wait for Embla API to be ready

    setOnboardingActive(true); // Disable user input on carousel
    setIsBlocked(true); // Block touch at the start of each step

    const unblockTimer = setTimeout(() => {
      setIsBlocked(false); // Unblock touch after 500ms
    }, 500);

    const advanceTimer = setTimeout(() => {
      // Movement is now handled by handleAdvanceStep, so only advance the step here
      handleAdvanceStep();
    }, currentStep.delay);

    return () => {
      clearTimeout(unblockTimer);
      clearTimeout(advanceTimer);
    };
  }, [currentStepIndex, isEmblaApiReady, setOnboardingActive, currentStep.delay, handleAdvanceStep]);

  // No skip button for automated flow, it progresses automatically
  // No "Next" button, it progresses automatically

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" // Dark transparent background for readability
      onClick={!isBlocked ? handleAdvanceStep : undefined} // Only allow click if not blocked
    >
      {isBlocked && (
        <div className="absolute inset-0 z-50 cursor-not-allowed bg-transparent" />
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="relative text-center pointer-events-auto max-w-md px-4" // Make relative for arrow positioning, ensure no overflow, and has padding
        >
          <h2 className="text-4xl font-bold font-headline text-white mb-4 drop-shadow-lg">
            {currentStep.title}
          </h2>
          <p className="text-xl text-white/90 mb-8 drop-shadow-md">
            {currentStep.description}
          </p>

          {/* Visual cues for automated actions */}
          {currentStep.id === "next-insight" && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 1 }}
              animate={{
                opacity: [0, 1, 1, 0],
                y: [50, 0, -30, -60], // Start low, move up, then further up and out
                scale: [1, 1.1, 1], // Subtle pulse
              }}
              transition={{
                duration: 1.2, // Slightly faster
                ease: "easeOut", // More natural for a swipe
                repeat: Infinity,
                repeatDelay: 0.8, // Longer pause between repeats
              }}
              className="absolute top-3/4 left-1/2 -translate-x-1/2" // Position relative to text container's bottom
            >
              <ArrowUp className="w-16 h-16 text-white" />
            </motion.div>
          )}
          {currentStep.id === "deep-dive" && (
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 1 }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: [50, 0, -30, -60], // Start right, move left, then further left and out
                scale: [1, 1.1, 1], // Subtle pulse
              }}
              transition={{
                duration: 1.2, // Slightly faster
                ease: "easeOut", // More natural for a swipe
                repeat: Infinity,
                repeatDelay: 0.8, // Longer pause between repeats
              }}
              className="absolute top-3/4 left-1/2 -translate-x-1/2" // Position relative to text container's right
            >
              <ArrowLeft className="w-16 h-16 text-white" />
            </motion.div>
          )}
          {currentStep.id === "full-article" && ( // Add ArrowLeft for full-article
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 1 }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: [50, 0, -30, -60], // Start right, move left, then further left and out
                scale: [1, 1.1, 1], // Subtle pulse
              }}
              transition={{
                duration: 1.2, // Slightly faster
                ease: "easeOut", // More natural for a swipe
                repeat: Infinity,
                repeatDelay: 0.8, // Longer pause between repeats
              }}
              className="absolute top-3/4 left-1/2 -translate-x-1/2" // Position relative to text container's right
            >
              <ArrowLeft className="w-16 h-16 text-white" />
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}