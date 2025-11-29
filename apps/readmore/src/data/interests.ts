import { interestsData } from "./interests-data";
import type { Interest } from "@/types";

export const getInterestBySlug = async (slug: string): Promise<Interest | undefined> => {
    const found = interestsData.find(interest => interest.name === slug);
    if (found) {
        return {
            ...found,
        };
    }
    return undefined;
};

export const getAllInterests = async (): Promise<Interest[]> => {
    return interestsData;
};
