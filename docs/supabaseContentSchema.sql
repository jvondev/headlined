-- Enable the uuid-ossp extension (for UUID generation)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create the insights table
CREATE TABLE IF NOT EXISTS insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,

    -- SEO fields
    seo_title TEXT,
    seo_description TEXT,

    -- Main content fields
    category TEXT[], -- stored as array of text
    title TEXT NOT NULL,
    headline TEXT,
    summary TEXT,
    deep_dives JSONB, -- flexible schema for deep dive blocks
    blog_content TEXT, -- markdown content

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_insights_slug ON insights (slug);
CREATE INDEX IF NOT EXISTS idx_insights_category ON insights USING GIN (category);
