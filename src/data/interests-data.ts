import type { Interest } from "@/types";

export const interestsData: Omit<Interest, 'id' | 'topic_id'>[] = [
  {
    name: "artificial intelligence",
    aliases: ["AI", "machine learning", "deep learning"],
    icon: "Brain",
  },
  {
    name: "web development",
    aliases: ["frontend", "backend", "fullstack", "javascript", "react", "next.js"],
    icon: "Code",
  },
  {
    name: "cybersecurity",
    aliases: ["security", "hacking", "infosec"],
    icon: "Shield",
  },
];