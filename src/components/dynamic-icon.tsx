"use client";

import type { FC } from "react";
import dynamic from "next/dynamic";
import type { LucideProps } from "lucide-react";
import React from "react"; // Import React for React.memo
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface DynamicIconProps extends LucideProps {
  name: string; // Name is now a generic string
  skeletonBgClass?: string; // New prop for skeleton background class
}

// Create a component that handles the dynamic import
const DynamicIconComponent: FC<DynamicIconProps> = ({ name, skeletonBgClass, ...props }) => {
  const LucideIcon = dynamic(() => import("lucide-react").then((mod) => {
    const IconComponent = mod[name as keyof typeof mod] as React.ComponentType<LucideProps>;
    if (!IconComponent) {
      console.warn(`Lucide icon "${name}" not found.`);
      return () => null; // Return a component that renders null
    }
    return IconComponent;
  }), {
    ssr: false, // Ensure this component is rendered on the client side
    loading: () => <Skeleton className={cn(props.className, "rounded-md", skeletonBgClass)} />, // Use skeletonBgClass here
  });

  return <LucideIcon {...props} />;
};

// Memoize the DynamicIconComponent itself
export const DynamicIcon = React.memo(DynamicIconComponent);
DynamicIcon.displayName = "DynamicIcon";