-- ============================================================
-- Pixenox — Storage Buckets
-- Migration 003: Storage
-- ============================================================

INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('logos', 'logos', true),
  ('hero-images', 'hero-images', true),
  ('service-images', 'service-images', true),
  ('service-tools', 'service-tools', true),
  ('case-study', 'case-study', true),
  ('avatars', 'avatars', true),
  ('company-logos', 'company-logos', true),
  ('og-images', 'og-images', true),
  ('icons', 'icons', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access policies for all buckets
CREATE POLICY "Public Read Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('logos', 'hero-images', 'service-images', 'service-tools', 'case-study', 'avatars', 'company-logos', 'og-images', 'icons') );

-- Admin full access policies for all buckets
CREATE POLICY "Admin Full Access" ON storage.objects FOR ALL USING (
  -- Again using the same logic for admin check
  ((current_setting('request.jwt.claims', true)::jsonb ->> 'user_metadata')::jsonb ->> 'role') = 'admin'
);
