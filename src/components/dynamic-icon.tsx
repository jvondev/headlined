
"use client";

import type { FC } from "react";
import { Quote, HelpCircle, ListChecks, Columns, ListOrdered, BookText, BarChart3, ShieldAlert, Shuffle, Info, Rss, Bookmark, MoreVertical, ThumbsUp, ThumbsDown, Pencil, type LucideProps } from "lucide-react";
import type { IconName } from "@/types";

const iconMap: Record<IconName, FC<LucideProps>> = {
  Quote,
  HelpCircle,
  ListChecks,
  Columns,
  ListOrdered,
  BookText,
  BarChart3,
  ShieldAlert,
  Shuffle,
  Info,
  Rss,
  Bookmark,
  MoreVertical,
  ThumbsUp,
  ThumbsDown,
  Pencil,
};

interface DynamicIconProps extends LucideProps {
  name: IconName;
}

export const DynamicIcon: FC<DynamicIconProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    // Optionally return a default icon or null
    return null;
  }

  return <IconComponent {...props} />;
};
