import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

export function splitIntoSubsentences(text: string): string[] {
  if (!text) return [];

  // Split by common delimiters, including "and", "or", "—", and quotes
  const rawSubsentences = text.split(/[,.;—!?\"']| and | or /i).map(s => s.trim()).filter(s => s.length > 0);

  // Simple balancing: if a subsentence is too short, try to combine it with the next one
  const balancedSubsentences: string[] = [];
  for (let i = 0; i < rawSubsentences.length; i++) {
    let current = rawSubsentences[i];
    // Define a threshold for "too short" - e.g., less than 10 characters
    while (current.length < 10 && i + 1 < rawSubsentences.length) {
      // Add a space or appropriate punctuation if combining
      const separator = rawSubsentences[i].match(/[,.;—!?\"']$/) ? '' : ' ';
      current += separator + rawSubsentences[i + 1];
      i++;
    }
    balancedSubsentences.push(current);
  }

  return balancedSubsentences;
}
