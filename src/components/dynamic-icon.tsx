"use client";

import type { FC } from "react";
import dynamic from "next/dynamic";
import type { LucideProps } from "lucide-react";
import React from "react"; // Import React for React.memo

interface DynamicIconProps extends LucideProps {
  name: string; // Name is now a generic string
}

// Create a component that handles the dynamic import
const DynamicIconComponent: FC<DynamicIconProps> = ({ name, ...props }) => {
  const LucideIcon = dynamic(() => import("lucide-react").then((mod) => {
    const IconComponent = mod[name as keyof typeof mod] as React.ComponentType<LucideProps>;
    if (!IconComponent) {
      console.warn(`Lucide icon "${name}" not found.`);
      return () => null; // Return a component that renders null
    }
    return IconComponent;
  }), {
    ssr: false, // Ensure this component is rendered on the client side
    loading: () => <div className={`${props.className} bg-muted rounded-md`} />, // Show static placeholder while loading
  });

  return <LucideIcon {...props} />;
};

// Memoize the DynamicIconComponent itself
export const DynamicIcon = React.memo(DynamicIconComponent);
DynamicIcon.displayName = "DynamicIcon";