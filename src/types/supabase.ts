// This file is a placeholder. Please generate your Supabase types using the Supabase CLI:
// supabase gen types typescript --project-id "YOUR_PROJECT_ID" --schema public > src/types/supabase.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      posts: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          link: string;
          slug: string;
          thumbnail_url: string | null;
          title: string;
          topic: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          link: string;
          slug: string;
          thumbnail_url?: string | null;
          title: string;
          topic?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          link?: string;
          slug?: string;
          thumbnail_url?: string | null;
          title?: string;
          topic?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
