-- Add icon_svg column to services_cards table
ALTER TABLE services_cards ADD COLUMN IF NOT EXISTS icon_svg text;
