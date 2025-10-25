import { topicsData } from "./topics-data";
import type { Topic } from "@/types";

export const getTopics = async (): Promise<Topic[]> => {
    return topicsData.map(topic => ({
        ...topic,
    }));
};

export const getTopicBySlug = async (slug: string): Promise<Topic | undefined> => {
    const found = topicsData.find(topic => topic.name === slug);
    if (found) {
        return {
            ...found,
        };
    }
    return undefined;
};