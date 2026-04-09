-- ============================================================
-- Pixenox — Service Card Tech Stack Column
-- Migration 006
-- ============================================================

ALTER TABLE services_cards
ADD COLUMN technology_stack TEXT[] DEFAULT '{}';
