-- Convert technology_stack from text[] to jsonb array of objects
ALTER TABLE services_cards RENAME COLUMN technology_stack TO old_technology_stack;

ALTER TABLE services_cards ADD COLUMN IF NOT EXISTS technology_stack jsonb DEFAULT '[]'::jsonb;

UPDATE services_cards
SET technology_stack = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object('name', item, 'svg', '')), '[]'::jsonb)
  FROM unnest(old_technology_stack) AS item
)
WHERE old_technology_stack IS NOT NULL;

ALTER TABLE services_cards DROP COLUMN old_technology_stack;
