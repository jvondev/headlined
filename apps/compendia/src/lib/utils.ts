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

export function splitIntoSubsentences(text: string): { mainSentence: string; subsentence?: string } {
    if (!text) return { mainSentence: "", subsentence: undefined };

    // Preprocessing: Remove leading quote characters and optional space
    const leadingQuoteChars = ['"', '“', '‘', '”', '’']; // Include all possible leading quotes
    for (const q of leadingQuoteChars) {
        if (text.startsWith(q)) {
            text = text.substring(q.length);
            if (text.startsWith(' ')) { // Remove space after quote if present
                text = text.substring(1);
            }
            break; // Only remove the first leading quote
        }
    }
    text = text.trim(); // Trim after preprocessing

    // Helper to check if a comma is part of a date
    const isCommaInDate = (str: string, commaPos: number): boolean => {
        // Look for "Month Day, Year" or "Day, Year" pattern around the comma
        // This is a simplified check and might not catch all date formats
        const datePattern = /\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},\s+\d{4}\b|\b\d{1,2},\s+\d{4}\b/i;

        // Get a substring around the comma to check for date pattern
        const checkWindow = str.substring(Math.max(0, commaPos - 20), Math.min(str.length, commaPos + 20));
        return datePattern.test(checkWindow);
    };

    // Helper to remove leading/trailing quotes
    const removeLeadingTrailingQuotes = (str: string): string => {
        let result = str;

        // Define all possible leading/trailing quote characters
        const leadingQuotes = ['"', '“', '‘'];
        const trailingQuotes = ['"', '”', '’'];

        // Remove leading quote if present
        for (const q of leadingQuotes) {
            if (result.startsWith(q)) {
                result = result.substring(1);
                break; // Remove only the first leading quote
            }
        }

        // Remove trailing quote if present
        for (const q of trailingQuotes) {
            if (result.endsWith(q)) {
                result = result.substring(0, result.length - 1);
                break; // Remove only the first trailing quote
            }
        }

        return result.trim(); // Trim again after removing quotes
    };

    const potentialSplits: { index: number; len: number; char: string; includeInSub: boolean }[] = [];

    // Delimiters to consider, with their lengths and whether they should be included in the subsentence
    const delimiterChars = [
        { char: ', ', len: 2, includeInSub: false },
        { char: '—', len: 1, includeInSub: false },
        { char: ':', len: 1, includeInSub: false },
        { char: ';', len: 1, includeInSub: false },
        { char: ' and ', len: 5, includeInSub: true },
        { char: '&', len: 1, includeInSub: true },
        { char: ' with ', len: 6, includeInSub: true },
    ];

    for (const del of delimiterChars) {
        let currentSearchIndex = 0;
        while ((currentSearchIndex = text.indexOf(del.char, currentSearchIndex)) !== -1) {
            // Special handling for comma-space to avoid dates
            if (del.char === ', ' && isCommaInDate(text, currentSearchIndex)) {
                currentSearchIndex += del.len;
                continue;
            }
            potentialSplits.push({ index: currentSearchIndex, len: del.len, char: del.char, includeInSub: del.includeInSub });
            currentSearchIndex += del.len;
        }
    }

    // Sort potential splits by their index
    potentialSplits.sort((a, b) => a.index - b.index);

    const MIN_MAIN_WORDS = 5; // Minimum words for the main sentence
    const BALANCE_RATIO = 0.5; // mainWordCount should be at least 50% of subWordCount

    for (const splitPoint of potentialSplits) {
        let main: string;
        let sub: string;

        if (splitPoint.includeInSub) {
            main = text.substring(0, splitPoint.index).trim();
            sub = text.substring(splitPoint.index).trim(); // Sub starts with the delimiter
        } else {
            main = text.substring(0, splitPoint.index + splitPoint.len).trim();
            sub = text.substring(splitPoint.index + splitPoint.len).trim();
        }

        const mainWordCount = main.split(/\s+/).filter(word => word.length > 0).length;
        const subWordCount = sub.split(/\s+/).filter(word => word.length > 0).length;

        if (mainWordCount >= MIN_MAIN_WORDS && mainWordCount >= BALANCE_RATIO * subWordCount) {
            return { mainSentence: removeLeadingTrailingQuotes(main), subsentence: removeLeadingTrailingQuotes(sub) };
        }
    }

    // If no valid split is found after checking all potential delimiters
    return { mainSentence: removeLeadingTrailingQuotes(text), subsentence: undefined };
}

export function truncateWords(str: string, numWords: number): string {
    if (!str) return "";
    const words = str.split(" ");
    if (words.length <= numWords) {
        return str;
    }
    return words.slice(0, numWords).join(" ") + "...";
}
