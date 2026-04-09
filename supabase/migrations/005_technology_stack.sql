-- ============================================================
-- Pixenox — Technology Stack schema
-- Migration 005
-- ============================================================

CREATE TABLE IF NOT EXISTS technology_stack_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_heading TEXT,
  heading_font_family TEXT DEFAULT 'Outfit',
  heading_font_size TEXT DEFAULT '2.5rem',
  heading_font_weight TEXT DEFAULT '800',
  heading_color TEXT DEFAULT '#ffffff',
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS technology_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_name TEXT NOT NULL,
  category_font_family TEXT DEFAULT 'Inter',
  category_font_size TEXT DEFAULT '1.5rem',
  category_font_weight TEXT DEFAULT '700',
  category_color TEXT DEFAULT '#ffffff',
  priority INT DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
