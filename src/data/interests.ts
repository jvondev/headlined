'use server';

import { serverSupabase } from "@/lib/server-supabase";
import { Interest } from "@/types";

export const getInterests = async (): Promise<Interest[]> => {
    const { data, error } = await serverSupabase.from('interests').select('*');

    if (error) {
        console.error('Error fetching interests:', error);
        return [];
    }

    return data as Interest[];
};
