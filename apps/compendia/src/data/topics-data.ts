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
    icon: "Goal",
  },
  {
    name: "science",
    icon: "Atom",
  },
  {
    name: "gaming",
    icon: "Gamepad",
  },
  {
    name: "finance",
    icon: "Banknote",
  },
  {
    name: "jobs",
    icon: "Briefcase",
  },
  {
    name: "business",
    icon: "Building2",
  },
  {
    name: "politic",
    icon: "Landmark",
  },
];
