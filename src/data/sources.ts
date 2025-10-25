import { sourcesData } from "./sources-data";
import type { Source } from "@/types";

export const getAllSources = async (): Promise<Source[]> => {
    return sourcesData.map(source => ({
        ...source,
    }));
};

export const getSourceByName = async (name: string): Promise<Source | undefined> => {
    const found = sourcesData.find(source => source.name === name);
    if (found) {
        return {
            ...found,
        };
    }
    return undefined;
};