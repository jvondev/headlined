-- Create blog_posts table
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  link TEXT UNIQUE NOT NULL,
  pub_date TIMESTAMP WITH TIME ZONE,
  author TEXT,
  thumbnail_url TEXT,
  original_feed_url TEXT NOT NULL,
  blog_content TEXT,
  category TEXT NOT NULL,
  source TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create rss_sources table
CREATE TABLE rss_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  card_background_color TEXT,
  label_font_color TEXT,
  fallback_icon_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) for both tables
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE rss_sources ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (read-only for now)
CREATE POLICY "Enable read access for all users" ON blog_posts
  FOR SELECT USING (TRUE);

CREATE POLICY "Enable read access for all users" ON rss_sources
  FOR SELECT USING (TRUE);

-- Optional: Add indexes for performance
CREATE INDEX idx_blog_posts_pub_date ON blog_posts (pub_date DESC);
CREATE INDEX idx_blog_posts_category ON blog_posts (category);
CREATE INDEX idx_blog_posts_source ON blog_posts (source);
CREATE INDEX idx_rss_sources_category ON rss_sources (category);