import type { Topic } from "@/types";

export const topicsData: Omit<Topic, 'id' | 'created_at'>[] = [
  {
    name: "tech",
    icon: "Laptop",
  },
  {
    name: "news",
    icon: "Newspaper",
  },
  {
    name: "sports",
    icon: "Football",
  },
];