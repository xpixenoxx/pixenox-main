-- Migration: Remove Typography Controls
-- Description: Drops font-related columns from all tables as requested.

BEGIN;

-- brand_settings
ALTER TABLE brand_settings 
  DROP COLUMN IF EXISTS company_name_font_family, 
  DROP COLUMN IF EXISTS company_name_font_size, 
  DROP COLUMN IF EXISTS company_name_font_weight, 
  DROP COLUMN IF EXISTS company_name_letter_spacing;

-- hero_settings
ALTER TABLE hero_settings 
  DROP COLUMN IF EXISTS headline_font_family, 
  DROP COLUMN IF EXISTS headline_font_size, 
  DROP COLUMN IF EXISTS headline_font_weight, 
  DROP COLUMN IF EXISTS headline_letter_spacing, 
  DROP COLUMN IF EXISTS headline_line_height, 
  DROP COLUMN IF EXISTS subheadline_font_family, 
  DROP COLUMN IF EXISTS subheadline_font_size, 
  DROP COLUMN IF EXISTS subheadline_font_weight, 
  DROP COLUMN IF EXISTS subheadline_line_height, 
  DROP COLUMN IF EXISTS cta_font_family, 
  DROP COLUMN IF EXISTS cta_font_size, 
  DROP COLUMN IF EXISTS cta_font_weight, 
  DROP COLUMN IF EXISTS cta_letter_spacing;

-- services_cards
ALTER TABLE services_cards 
  DROP COLUMN IF EXISTS title_font_family, 
  DROP COLUMN IF EXISTS title_font_size, 
  DROP COLUMN IF EXISTS title_font_weight, 
  DROP COLUMN IF EXISTS subheading_font_family, 
  DROP COLUMN IF EXISTS subheading_font_size, 
  DROP COLUMN IF EXISTS desc_font_family, 
  DROP COLUMN IF EXISTS desc_font_size, 
  DROP COLUMN IF EXISTS desc_line_height;

-- why_choose_us
ALTER TABLE why_choose_us 
  DROP COLUMN IF EXISTS stat_font_family, 
  DROP COLUMN IF EXISTS stat_font_size, 
  DROP COLUMN IF EXISTS stat_font_weight, 
  DROP COLUMN IF EXISTS label_font_family, 
  DROP COLUMN IF EXISTS label_font_size, 
  DROP COLUMN IF EXISTS desc_font_family, 
  DROP COLUMN IF EXISTS desc_font_size;

-- why_choose_us_config
ALTER TABLE why_choose_us_config 
  DROP COLUMN IF EXISTS heading_font_family, 
  DROP COLUMN IF EXISTS heading_font_size, 
  DROP COLUMN IF EXISTS heading_font_weight, 
  DROP COLUMN IF EXISTS heading_letter_spacing, 
  DROP COLUMN IF EXISTS sub_font_family, 
  DROP COLUMN IF EXISTS sub_font_size, 
  DROP COLUMN IF EXISTS cta_font_family, 
  DROP COLUMN IF EXISTS cta_font_size, 
  DROP COLUMN IF EXISTS cta_font_weight;

-- what_we_do_cards
ALTER TABLE what_we_do_cards 
  DROP COLUMN IF EXISTS title_font_family, 
  DROP COLUMN IF EXISTS title_font_size, 
  DROP COLUMN IF EXISTS title_font_weight, 
  DROP COLUMN IF EXISTS desc_font_family, 
  DROP COLUMN IF EXISTS desc_font_size;

-- core_beliefs
ALTER TABLE core_beliefs 
  DROP COLUMN IF EXISTS title_font_family, 
  DROP COLUMN IF EXISTS title_font_size, 
  DROP COLUMN IF EXISTS title_font_weight, 
  DROP COLUMN IF EXISTS desc_font_family, 
  DROP COLUMN IF EXISTS desc_font_size;

-- how_we_think_config
ALTER TABLE how_we_think_config 
  DROP COLUMN IF EXISTS heading_font_family, 
  DROP COLUMN IF EXISTS heading_font_size, 
  DROP COLUMN IF EXISTS heading_font_weight, 
  DROP COLUMN IF EXISTS sub_font_family, 
  DROP COLUMN IF EXISTS sub_font_size;

-- page_hero_config
ALTER TABLE page_hero_config 
  DROP COLUMN IF EXISTS heading_font_family, 
  DROP COLUMN IF EXISTS heading_font_size, 
  DROP COLUMN IF EXISTS heading_font_weight, 
  DROP COLUMN IF EXISTS heading_letter_spacing, 
  DROP COLUMN IF EXISTS subheading_font_family, 
  DROP COLUMN IF EXISTS subheading_font_size, 
  DROP COLUMN IF EXISTS subheading_font_weight;

-- cta_sections
ALTER TABLE cta_sections 
  DROP COLUMN IF EXISTS heading_font_family, 
  DROP COLUMN IF EXISTS heading_font_size, 
  DROP COLUMN IF EXISTS heading_font_weight, 
  DROP COLUMN IF EXISTS heading_letter_spacing, 
  DROP COLUMN IF EXISTS subheading_font_family, 
  DROP COLUMN IF EXISTS subheading_font_size, 
  DROP COLUMN IF EXISTS btn_font_family, 
  DROP COLUMN IF EXISTS btn_font_size, 
  DROP COLUMN IF EXISTS btn_font_weight, 
  DROP COLUMN IF EXISTS btn_letter_spacing;

-- section_config
ALTER TABLE section_config 
  DROP COLUMN IF EXISTS heading_font_family, 
  DROP COLUMN IF EXISTS heading_font_size, 
  DROP COLUMN IF EXISTS heading_font_weight, 
  DROP COLUMN IF EXISTS subheading_font_family, 
  DROP COLUMN IF EXISTS subheading_font_size;

COMMIT;
