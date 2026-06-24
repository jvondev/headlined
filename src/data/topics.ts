import { topicsData } from "./topics-data";
import type { Topic } from "@/types";

export const getTopicBySlug = async (slug: string): Promise<Topic | undefined> => {
    const found = topicsData.find(topic => topic.name === slug);
    if (found) {
        return {
            ...found,
        };
    }
    return undefined;
};

export const getAllTopics = async (): Promise<Topic[]> => {
    return topicsData;
};