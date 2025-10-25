'use server';

import { serverSupabase } from "@/lib/server-supabase";
import { Topic } from "@/types";

export const getTopics = async (): Promise<Topic[]> => {
    const { data, error } = await serverSupabase.from('topics').select('*');

    if (error) {
        console.error('Error fetching topics:', error);
        return [];
    }

    return data as Topic[];
};
