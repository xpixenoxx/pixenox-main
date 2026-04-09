-- ============================================================
-- Pixenox — Complete Database Schema
-- Migration 001: Initial Schema
-- ============================================================

-- =========================
-- theme_settings
-- =========================
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- brand_settings
-- =========================
CREATE TABLE brand_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  logo_url TEXT,
  company_name TEXT NOT NULL,
  company_name_font_family TEXT DEFAULT 'Inter',
  company_name_font_size TEXT DEFAULT '1.5rem',
  company_name_font_weight TEXT DEFAULT '700',
  company_name_letter_spacing TEXT DEFAULT '-0.01em',
  company_name_color TEXT DEFAULT '#ffffff',
  favicon_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- nav_config
-- =========================
CREATE TABLE nav_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  priority INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- =========================
-- seo_config
-- =========================
CREATE TABLE seo_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT UNIQUE NOT NULL,
  title TEXT,
  description TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  keywords TEXT[]
);

-- =========================
-- hero_settings
-- =========================
CREATE TABLE hero_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL,
  headline_font_family TEXT DEFAULT 'Outfit',
  headline_font_size TEXT DEFAULT '4.5rem',
  headline_font_weight TEXT DEFAULT '800',
  headline_letter_spacing TEXT DEFAULT '-0.03em',
  headline_line_height TEXT DEFAULT '1.1',
  headline_color TEXT DEFAULT '#ffffff',
  subheadline TEXT,
  subheadline_font_family TEXT DEFAULT 'Inter',
  subheadline_font_size TEXT DEFAULT '1.25rem',
  subheadline_font_weight TEXT DEFAULT '400',
  subheadline_line_height TEXT DEFAULT '1.7',
  subheadline_color TEXT DEFAULT 'rgba(255,255,255,0.75)',
  cta_text TEXT,
  cta_url TEXT,
  cta_font_family TEXT DEFAULT 'Inter',
  cta_font_size TEXT DEFAULT '1rem',
  cta_font_weight TEXT DEFAULT '600',
  cta_letter_spacing TEXT DEFAULT '0.02em',
  cta_bg_color TEXT DEFAULT '#4a0e8f',
  cta_hover_bg_color TEXT DEFAULT '#6b21d4',
  cta_text_color TEXT DEFAULT '#ffffff',
  cta_border_radius TEXT DEFAULT '8px',
  bg_type TEXT DEFAULT 'gradient',
  bg_gradient_start TEXT DEFAULT '#0a0a0f',
  bg_gradient_end TEXT DEFAULT '#1a0533',
  bg_image_url TEXT,
  bg_video_url TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- services_layout
-- =========================
CREATE TABLE services_layout (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  layout_type TEXT DEFAULT 'horizontal',
  cards_per_row INT DEFAULT 3,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- services_cards
-- =========================
CREATE TABLE services_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_font_family TEXT DEFAULT 'Outfit',
  title_font_size TEXT DEFAULT '1.25rem',
  title_font_weight TEXT DEFAULT '700',
  title_color TEXT DEFAULT '#ffffff',
  subheading TEXT,
  subheading_font_family TEXT DEFAULT 'Inter',
  subheading_font_size TEXT DEFAULT '0.9rem',
  subheading_color TEXT DEFAULT 'rgba(255,255,255,0.6)',
  description TEXT,
  desc_font_family TEXT DEFAULT 'Inter',
  desc_font_size TEXT DEFAULT '0.95rem',
  desc_line_height TEXT DEFAULT '1.65',
  desc_color TEXT DEFAULT 'rgba(255,255,255,0.75)',
  image_url TEXT,
  page_slug TEXT UNIQUE NOT NULL,
  priority INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- card_tools
-- =========================
CREATE TABLE card_tools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id UUID REFERENCES services_cards(id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  tool_svg_url TEXT,
  tool_svg_inline TEXT,
  priority INT DEFAULT 0,
  CONSTRAINT max_tools_per_card CHECK (priority <= 6)
);

-- =========================
-- case_studies
-- =========================
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  cover_image_url TEXT,
  short_description TEXT,
  body_content TEXT,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'completed',
  priority INT DEFAULT 0,
  tools_used TEXT[],
  live_url TEXT,
  github_url TEXT,
  client_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- work_tags
-- =========================
CREATE TABLE work_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  color TEXT DEFAULT '#6b21d4',
  priority INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- =========================
-- why_choose_us
-- =========================
CREATE TABLE why_choose_us (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_svg TEXT,
  stat TEXT,
  stat_font_family TEXT DEFAULT 'Outfit',
  stat_font_size TEXT DEFAULT '2.5rem',
  stat_font_weight TEXT DEFAULT '800',
  stat_color TEXT DEFAULT '#ffffff',
  label TEXT NOT NULL,
  label_font_family TEXT DEFAULT 'Inter',
  label_font_size TEXT DEFAULT '1rem',
  label_color TEXT DEFAULT 'rgba(255,255,255,0.8)',
  description TEXT,
  desc_font_family TEXT DEFAULT 'Inter',
  desc_font_size TEXT DEFAULT '0.9rem',
  desc_color TEXT DEFAULT 'rgba(255,255,255,0.65)',
  priority INT DEFAULT 0
);

-- =========================
-- why_choose_us_config
-- =========================
CREATE TABLE why_choose_us_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_heading TEXT,
  heading_font_family TEXT DEFAULT 'Outfit',
  heading_font_size TEXT DEFAULT '2.5rem',
  heading_font_weight TEXT DEFAULT '800',
  heading_letter_spacing TEXT DEFAULT '-0.02em',
  heading_color TEXT DEFAULT '#ffffff',
  section_subheading TEXT,
  sub_font_family TEXT DEFAULT 'Inter',
  sub_font_size TEXT DEFAULT '1.1rem',
  sub_color TEXT DEFAULT 'rgba(255,255,255,0.7)',
  cta_text TEXT,
  cta_font_family TEXT DEFAULT 'Inter',
  cta_font_size TEXT DEFAULT '1rem',
  cta_font_weight TEXT DEFAULT '600',
  cta_url TEXT,
  cta_bg_color TEXT DEFAULT '#4a0e8f',
  cta_hover_bg_color TEXT DEFAULT '#6b21d4',
  cta_border_radius TEXT DEFAULT '8px',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- testimonials
-- =========================
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_name TEXT NOT NULL,
  reviewer_title TEXT,
  company TEXT,
  avatar_url TEXT,
  company_logo_url TEXT,
  review_text TEXT NOT NULL,
  rating INT DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  priority INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- footer_config
-- =========================
CREATE TABLE footer_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  linkedin_url TEXT,
  github_url TEXT,
  reddit_url TEXT,
  copyright_text TEXT DEFAULT '© {year} Pixenox. All rights reserved.',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- footer_links
-- =========================
CREATE TABLE footer_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section TEXT NOT NULL,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  priority INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- =========================
-- company_story
-- =========================
CREATE TABLE company_story (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_json JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- what_we_do_cards
-- =========================
CREATE TABLE what_we_do_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_font_family TEXT DEFAULT 'Outfit',
  title_font_size TEXT DEFAULT '1.25rem',
  title_font_weight TEXT DEFAULT '700',
  title_color TEXT DEFAULT '#ffffff',
  description TEXT,
  desc_font_family TEXT DEFAULT 'Inter',
  desc_font_size TEXT DEFAULT '0.95rem',
  desc_color TEXT DEFAULT 'rgba(255,255,255,0.75)',
  icon_svg TEXT,
  priority INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- =========================
-- core_beliefs
-- =========================
CREATE TABLE core_beliefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  title_font_family TEXT DEFAULT 'Outfit',
  title_font_size TEXT DEFAULT '1.1rem',
  title_font_weight TEXT DEFAULT '700',
  title_color TEXT DEFAULT '#ffffff',
  description TEXT,
  desc_font_family TEXT DEFAULT 'Inter',
  desc_font_size TEXT DEFAULT '0.95rem',
  desc_color TEXT DEFAULT 'rgba(255,255,255,0.75)',
  icon_svg TEXT,
  priority INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true
);

-- =========================
-- how_we_think_config
-- =========================
CREATE TABLE how_we_think_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_heading TEXT,
  heading_font_family TEXT DEFAULT 'Outfit',
  heading_font_size TEXT DEFAULT '2.5rem',
  heading_font_weight TEXT DEFAULT '800',
  heading_color TEXT DEFAULT '#ffffff',
  section_subheading TEXT,
  sub_font_family TEXT DEFAULT 'Inter',
  sub_font_size TEXT DEFAULT '1.1rem',
  sub_color TEXT DEFAULT 'rgba(255,255,255,0.7)',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- cta_sections
-- =========================
CREATE TABLE cta_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  heading TEXT,
  heading_font_family TEXT DEFAULT 'Outfit',
  heading_font_size TEXT DEFAULT '2.5rem',
  heading_font_weight TEXT DEFAULT '800',
  heading_letter_spacing TEXT DEFAULT '-0.02em',
  heading_color TEXT DEFAULT '#ffffff',
  subheading TEXT,
  subheading_font_family TEXT DEFAULT 'Inter',
  subheading_font_size TEXT DEFAULT '1.1rem',
  subheading_color TEXT DEFAULT 'rgba(255,255,255,0.75)',
  description_json JSONB,
  btn_text TEXT,
  btn_font_family TEXT DEFAULT 'Inter',
  btn_font_size TEXT DEFAULT '1rem',
  btn_font_weight TEXT DEFAULT '600',
  btn_letter_spacing TEXT DEFAULT '0.02em',
  btn_color TEXT DEFAULT '#4a0e8f',
  btn_hover_color TEXT DEFAULT '#6b21d4',
  btn_text_color TEXT DEFAULT '#ffffff',
  btn_border_radius TEXT DEFAULT '8px',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- page_hero_config
-- =========================
CREATE TABLE page_hero_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT UNIQUE NOT NULL,
  heading TEXT,
  heading_font_family TEXT DEFAULT 'Outfit',
  heading_font_size TEXT DEFAULT '3rem',
  heading_font_weight TEXT DEFAULT '800',
  heading_letter_spacing TEXT DEFAULT '-0.02em',
  heading_color TEXT DEFAULT '#ffffff',
  subheading TEXT,
  subheading_font_family TEXT DEFAULT 'Inter',
  subheading_font_size TEXT DEFAULT '1.1rem',
  subheading_font_weight TEXT DEFAULT '400',
  subheading_color TEXT DEFAULT 'rgba(255,255,255,0.75)',
  bg_gradient_start TEXT DEFAULT '#0a0a0f',
  bg_gradient_end TEXT DEFAULT '#1a0533',
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- section_config
-- =========================
CREATE TABLE section_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  heading TEXT,
  heading_font_family TEXT DEFAULT 'Outfit',
  heading_font_size TEXT DEFAULT '2.5rem',
  heading_font_weight TEXT DEFAULT '800',
  heading_color TEXT DEFAULT '#ffffff',
  subheading TEXT,
  subheading_font_family TEXT DEFAULT 'Inter',
  subheading_font_size TEXT DEFAULT '1.1rem',
  subheading_color TEXT DEFAULT 'rgba(255,255,255,0.7)',
  is_visible BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- contact_submissions
-- =========================
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  mobile TEXT,
  services_interested TEXT[],
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

-- =========================
-- audit_log
-- =========================
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);
