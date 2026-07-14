CREATE TABLE IF NOT EXISTS public.engineering_card_pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_slug TEXT NOT NULL,
  card_slug TEXT NOT NULL,
  
  -- Hero Section
  hero_title TEXT,
  hero_description TEXT,
  hero_image_url TEXT,
  
  -- Section 2
  section2_name TEXT,
  section2_description TEXT,
  section2_cards JSONB DEFAULT '[]'::jsonb, -- Array of { image_url, title, description }
  
  -- Section 3: Key Functions
  section3_name TEXT DEFAULT 'Key Functions',
  section3_description TEXT,
  section3_cards JSONB DEFAULT '[]'::jsonb, -- Array of { topic, description, link_url }
  
  -- Section 4: Key Outcomes
  section4_name TEXT DEFAULT 'Key Outcomes',
  section4_description TEXT,
  section4_cards JSONB DEFAULT '[]'::jsonb, -- Array of { logo_url, title, description }
  
  -- Section 5: Trends
  section5_name TEXT DEFAULT 'Current Modernization Trends',
  section5_description TEXT,
  section5_blog_slugs JSONB DEFAULT '[]'::jsonb, -- Array of strings (blog slugs)
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  
  UNIQUE(service_slug, card_slug)
);

-- Enable RLS
ALTER TABLE public.engineering_card_pages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.engineering_card_pages FOR SELECT
  USING (true);

CREATE POLICY "Users can insert/update/delete their own data."
  ON public.engineering_card_pages FOR ALL
  USING (auth.role() = 'authenticated');
