"use client";

import { FC, useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DynamicIcon } from "@/components/dynamic-icon";
import { Topic, Interest } from "@/types";
import { useSubscribedFeeds } from "@/hooks/use-subscribed-feeds";
import { LicenseValidationModal } from "@/components/support/license-validation-modal";

interface OnboardingFlowProps {
  isOpen: boolean;
  onClose: () => void;
  availableTopics: Topic[];
  availableInterests: Interest[];
}

export const OnboardingFlow: FC<OnboardingFlowProps> = ({
  isOpen,
  onClose,
  availableTopics,
  availableInterests,
}) => {
  const { subscribedTopics, subscribedInterests, subscribe } = useSubscribedFeeds();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  useEffect(() => {
    // Pre-select already subscribed items
    setSelectedTopics(subscribedTopics.map(topic => topic.name));
    setSelectedInterests(subscribedInterests.map(interest => interest.name));
  }, [subscribedTopics, subscribedInterests]);

  const handleTopicClick = (topic: Topic) => {
    setSelectedTopics((prev) =>
      prev.includes(topic.name)
        ? prev.filter((name) => name !== topic.name)
        : [...prev, topic.name]
    );
  };

  const handleInterestClick = (interest: Interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest.name)
        ? prev.filter((name) => name !== interest.name)
        : [...prev, interest.name]
    );
  };

  const handleSaveSelections = () => {
    selectedTopics.forEach(topicName => {
      const topic = availableTopics.find(t => t.name === topicName);
      if (topic) {
        subscribe(topic, 'topic');
      }
    });
    selectedInterests.forEach(interestName => {
      const interest = availableInterests.find(i => i.name === interestName);
      if (interest) {
        subscribe(interest, 'interest');
      }
    });
    onClose();
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-xl h-[80vh] flex flex-col p-6">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-3xl font-bold text-center mb-2">
            Welcome to Headlined!
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg text-muted-foreground">
            To get started, please tell us what you're interested in.
            You can pick multiple topics and interests.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex-1 overflow-hidden py-4">
          <ScrollArea className="h-full pr-4">
            <h3 className="text-xl font-semibold mb-3 text-primary">Topics</h3>
            <div className="flex flex-wrap gap-3 mb-8">
              {availableTopics.length > 0 ? (
                availableTopics.map((topic) => (
                  <Badge
                    key={topic.name}
                    variant={selectedTopics.includes(topic.name) ? "default" : "secondary"}
                    className="cursor-pointer px-4 py-2 text-base flex items-center"
                    onClick={() => handleTopicClick(topic)}
                  >
                    <DynamicIcon name={topic.icon || "File"} className="w-5 h-5 mr-2" />
                    {topic.name}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No topics available.</p>
              )}
            </div>

            <h3 className="text-xl font-semibold mb-3 text-primary">Interests</h3>
            <div className="flex flex-wrap gap-3">
              {availableInterests.length > 0 ? (
                availableInterests.map((interest) => (
                  <Badge
                    key={interest.name}
                    variant={selectedInterests.includes(interest.name) ? "default" : "secondary"}
                    className="cursor-pointer px-4 py-2 text-base flex items-center"
                    onClick={() => handleInterestClick(interest)}
                  >
                    <DynamicIcon name={interest.icon || "File"} className="w-5 h-5 mr-2" />
                    {interest.name}
                  </Badge>
                ))
              ) : (
                <p className="text-muted-foreground">No interests available.</p>
              )}
            </div>
          </ScrollArea>
        </div>

        <AlertDialogFooter className="pt-4 flex-col gap-2 sm:gap-0">
          <Button
            onClick={handleSaveSelections}
            disabled={selectedTopics.length === 0 && selectedInterests.length === 0}
            className="w-full text-lg py-3 mb-2 sm:mb-0"
          >
            Get Started
          </Button>
          <div className="w-full flex justify-center mt-2">
            <LicenseValidationModal
              trigger={
                <Button variant="link" size="sm" className="text-muted-foreground">
                  Have a Headlined+ key?
                </Button>
              }
            />
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
