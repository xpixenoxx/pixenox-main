-- ============================================================
-- Pixenox — RLS Policies
-- Migration 002: Row Level Security
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE seo_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_layout ENABLE ROW LEVEL SECURITY;
ALTER TABLE services_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_studies ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE why_choose_us ENABLE ROW LEVEL SECURITY;
ALTER TABLE why_choose_us_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_story ENABLE ROW LEVEL SECURITY;
ALTER TABLE what_we_do_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE core_beliefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE how_we_think_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE cta_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_hero_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE section_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Helper function created in the 'public' schema to avoid permissions issues.
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS BOOLEAN AS $$
BEGIN
  RETURN ((current_setting('request.jwt.claims', true)::jsonb ->> 'user_metadata')::jsonb ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =========================
-- Idempotent Policy Creation (Drop then Create)
-- =========================

-- theme_settings
DROP POLICY IF EXISTS "Public Read Access" ON theme_settings;
DROP POLICY IF EXISTS "Admin Full Access" ON theme_settings;
CREATE POLICY "Public Read Access" ON theme_settings FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON theme_settings FOR ALL USING (public.is_admin());

-- brand_settings
DROP POLICY IF EXISTS "Public Read Access" ON brand_settings;
DROP POLICY IF EXISTS "Admin Full Access" ON brand_settings;
CREATE POLICY "Public Read Access" ON brand_settings FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON brand_settings FOR ALL USING (public.is_admin());

-- nav_config
DROP POLICY IF EXISTS "Public Read Access" ON nav_config;
DROP POLICY IF EXISTS "Admin Full Access" ON nav_config;
CREATE POLICY "Public Read Access" ON nav_config FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON nav_config FOR ALL USING (public.is_admin());

-- seo_config
DROP POLICY IF EXISTS "Public Read Access" ON seo_config;
DROP POLICY IF EXISTS "Admin Full Access" ON seo_config;
CREATE POLICY "Public Read Access" ON seo_config FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON seo_config FOR ALL USING (public.is_admin());

-- hero_settings
DROP POLICY IF EXISTS "Public Read Access" ON hero_settings;
DROP POLICY IF EXISTS "Admin Full Access" ON hero_settings;
CREATE POLICY "Public Read Access" ON hero_settings FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON hero_settings FOR ALL USING (public.is_admin());

-- services_layout
DROP POLICY IF EXISTS "Public Read Access" ON services_layout;
DROP POLICY IF EXISTS "Admin Full Access" ON services_layout;
CREATE POLICY "Public Read Access" ON services_layout FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON services_layout FOR ALL USING (public.is_admin());

-- services_cards
DROP POLICY IF EXISTS "Public Read Access" ON services_cards;
DROP POLICY IF EXISTS "Admin Full Access" ON services_cards;
CREATE POLICY "Public Read Access" ON services_cards FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON services_cards FOR ALL USING (public.is_admin());

-- card_tools
DROP POLICY IF EXISTS "Public Read Access" ON card_tools;
DROP POLICY IF EXISTS "Admin Full Access" ON card_tools;
CREATE POLICY "Public Read Access" ON card_tools FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON card_tools FOR ALL USING (public.is_admin());

-- case_studies
DROP POLICY IF EXISTS "Public Read Access" ON case_studies;
DROP POLICY IF EXISTS "Admin Full Access" ON case_studies;
CREATE POLICY "Public Read Access" ON case_studies FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON case_studies FOR ALL USING (public.is_admin());

-- work_tags
DROP POLICY IF EXISTS "Public Read Access" ON work_tags;
DROP POLICY IF EXISTS "Admin Full Access" ON work_tags;
CREATE POLICY "Public Read Access" ON work_tags FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON work_tags FOR ALL USING (public.is_admin());

-- why_choose_us
DROP POLICY IF EXISTS "Public Read Access" ON why_choose_us;
DROP POLICY IF EXISTS "Admin Full Access" ON why_choose_us;
CREATE POLICY "Public Read Access" ON why_choose_us FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON why_choose_us FOR ALL USING (public.is_admin());

-- why_choose_us_config
DROP POLICY IF EXISTS "Public Read Access" ON why_choose_us_config;
DROP POLICY IF EXISTS "Admin Full Access" ON why_choose_us_config;
CREATE POLICY "Public Read Access" ON why_choose_us_config FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON why_choose_us_config FOR ALL USING (public.is_admin());

-- testimonials
DROP POLICY IF EXISTS "Public Read Access" ON testimonials;
DROP POLICY IF EXISTS "Admin Full Access" ON testimonials;
CREATE POLICY "Public Read Access" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON testimonials FOR ALL USING (public.is_admin());

-- footer_config
DROP POLICY IF EXISTS "Public Read Access" ON footer_config;
DROP POLICY IF EXISTS "Admin Full Access" ON footer_config;
CREATE POLICY "Public Read Access" ON footer_config FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON footer_config FOR ALL USING (public.is_admin());

-- footer_links
DROP POLICY IF EXISTS "Public Read Access" ON footer_links;
DROP POLICY IF EXISTS "Admin Full Access" ON footer_links;
CREATE POLICY "Public Read Access" ON footer_links FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON footer_links FOR ALL USING (public.is_admin());

-- company_story
DROP POLICY IF EXISTS "Public Read Access" ON company_story;
DROP POLICY IF EXISTS "Admin Full Access" ON company_story;
CREATE POLICY "Public Read Access" ON company_story FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON company_story FOR ALL USING (public.is_admin());

-- what_we_do_cards
DROP POLICY IF EXISTS "Public Read Access" ON what_we_do_cards;
DROP POLICY IF EXISTS "Admin Full Access" ON what_we_do_cards;
CREATE POLICY "Public Read Access" ON what_we_do_cards FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON what_we_do_cards FOR ALL USING (public.is_admin());

-- core_beliefs
DROP POLICY IF EXISTS "Public Read Access" ON core_beliefs;
DROP POLICY IF EXISTS "Admin Full Access" ON core_beliefs;
CREATE POLICY "Public Read Access" ON core_beliefs FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON core_beliefs FOR ALL USING (public.is_admin());

-- how_we_think_config
DROP POLICY IF EXISTS "Public Read Access" ON how_we_think_config;
DROP POLICY IF EXISTS "Admin Full Access" ON how_we_think_config;
CREATE POLICY "Public Read Access" ON how_we_think_config FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON how_we_think_config FOR ALL USING (public.is_admin());

-- cta_sections
DROP POLICY IF EXISTS "Public Read Access" ON cta_sections;
DROP POLICY IF EXISTS "Admin Full Access" ON cta_sections;
CREATE POLICY "Public Read Access" ON cta_sections FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON cta_sections FOR ALL USING (public.is_admin());

-- page_hero_config
DROP POLICY IF EXISTS "Public Read Access" ON page_hero_config;
DROP POLICY IF EXISTS "Admin Full Access" ON page_hero_config;
CREATE POLICY "Public Read Access" ON page_hero_config FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON page_hero_config FOR ALL USING (public.is_admin());

-- section_config
DROP POLICY IF EXISTS "Public Read Access" ON section_config;
DROP POLICY IF EXISTS "Admin Full Access" ON section_config;
CREATE POLICY "Public Read Access" ON section_config FOR SELECT USING (true);
CREATE POLICY "Admin Full Access" ON section_config FOR ALL USING (public.is_admin());

-- contact_submissions
DROP POLICY IF EXISTS "Public Insert Access" ON contact_submissions;
DROP POLICY IF EXISTS "Admin Full Access" ON contact_submissions;
DROP POLICY IF EXISTS "Admin Select Access" ON contact_submissions;
DROP POLICY IF EXISTS "Admin Update Access" ON contact_submissions;
DROP POLICY IF EXISTS "Admin Delete Access" ON contact_submissions;

CREATE POLICY "Public Insert Access" ON contact_submissions FOR INSERT WITH CHECK (true);
-- Using specific names so they do not conflict
CREATE POLICY "Admin Select Access" ON contact_submissions FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin Update Access" ON contact_submissions FOR UPDATE USING (public.is_admin());
CREATE POLICY "Admin Delete Access" ON contact_submissions FOR DELETE USING (public.is_admin());

-- audit_log
DROP POLICY IF EXISTS "Admin Select Access" ON audit_log;
DROP POLICY IF EXISTS "Admin Insert Access" ON audit_log;
CREATE POLICY "Admin Select Access" ON audit_log FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin Insert Access" ON audit_log FOR INSERT WITH CHECK (public.is_admin());
