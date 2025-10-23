"use client";

import { Interest } from "@/types";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { DynamicIcon } from "@/components/dynamic-icon";

interface InterestGridProps {
  interests: Interest[];
}

export function InterestGrid({ interests }: InterestGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {interests.map((interest) => (
        <Card
          key={interest.id}
          className="cursor-pointer overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 active:scale-95 aspect-[4/3]"
          style={{
            backgroundColor: interest.background_color || undefined,
            color: interest.text_color || undefined,
          }}
        >
          <CardContent className="p-4 flex flex-col h-full items-center justify-center">
            {interest.icon && <DynamicIcon name={interest.icon} className="h-8 w-8 mb-2" />}
            <CardTitle className="text-center text-sm font-medium truncate">
              {interest.name}
            </CardTitle>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
