import type { Interest } from "@/types";

export const interestsData: Omit<Interest, 'id' | 'topic_id'>[] = [
  {
    name: "artificial intelligence",
    aliases: ["AI", "machine learning", "deep learning"],
    icon: "Brain",
  },
  {
    name: "web development",
    aliases: ["frontend", "backend", "fullstack", "javascript", "react", "next.js", "typescript"],
    icon: "Code",
  },
  {
    name: "cybersecurity",
    aliases: ["security", "hacking", "infosec"],
    icon: "Shield",
  },
  {
    name: "space",
    aliases: ["astronomy", "space exploration", "cosmos"],
    icon: "Rocket",
  },
  {
    name: "health",
    aliases: ["medicine", "wellness", "fitness", "nutrition"],
    icon: "HeartPulse",
  },
  {
    name: "digital well-being",
    aliases: ["mindfulness", "attention", "social media detox", "tech balance"],
    icon: "HeartHandshake",
  },
  {
    name: "personal growth",
    aliases: ["self-improvement", "learning", "growth", "personal development"],
    icon: "BookOpen",
  },
  {
    name: "environmental science",
    aliases: ["sustainability", "climate change", "conservation", "ecology"],
    icon: "Leaf",
  },
  {
    name: "photography",
    aliases: ["camera", "visual arts", "photo editing", "visuals"],
    icon: "Camera",
  },
  {
    name: "productivity",
    aliases: ["time management", "focus", "efficiency", "workflow"],
    icon: "Timer",
  },
  {
    name: "reading",
    aliases: ["books", "literature", "reading habits", "book club"],
    icon: "Book",
  },
  {
    name: "cooking",
    aliases: ["recipes", "food", "culinary", "baking"],
    icon: "Utensils",
  },
  {
    name: "travel",
    aliases: ["adventure", "vacation", "explore", "destinations"],
    icon: "Plane",
  },
  {
    name: "music",
    aliases: ["songs", "artists", "genres", "instruments"],
    icon: "Music",
  },
];