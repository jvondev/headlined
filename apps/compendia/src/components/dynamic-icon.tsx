"use client";

import type { FC } from "react";
import dynamic from "next/dynamic";
import type { LucideProps } from "lucide-react";
import React from "react";
import { Skeleton } from "@repo/ui/components/ui/skeleton";
import { cn } from "@repo/lib/utils/utils";

// Cache for loaded icon components
const LoadedIcons = new Map<string, React.ComponentType<LucideProps>>();

interface DynamicIconProps extends LucideProps {
  name: string;
  skeletonBgClass?: string;
}

const DynamicIconComponent: FC<DynamicIconProps> = ({ name, skeletonBgClass, ...props }) => {
  const LucideIcon = React.useMemo(() => {
    if (LoadedIcons.has(name)) {
      return LoadedIcons.get(name)!;
    }

    return dynamic(() => import("lucide-react").then((mod) => {
      const IconComponent = mod[name as keyof typeof mod] as React.ComponentType<LucideProps>;
      if (!IconComponent) {
        console.warn(`Lucide icon "${name}" not found.`);
        return () => null;
      }
      LoadedIcons.set(name, IconComponent); // Cache the loaded component
      return IconComponent;
    }), {
      ssr: false,
      loading: () => <Skeleton className={cn(props.className, "rounded-md", skeletonBgClass)} />,
    });
  }, [name, props.className, skeletonBgClass]);

  return <LucideIcon {...props} />;
};

export const DynamicIcon = React.memo(DynamicIconComponent);
DynamicIcon.displayName = "DynamicIcon";
