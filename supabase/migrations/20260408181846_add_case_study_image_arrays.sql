-- Migration: Add image arrays to case_studies
-- Fields: gallery_images (text[]), pitch_deck_images (text[])

ALTER TABLE public.case_studies
ADD COLUMN gallery_images text[] DEFAULT '{}'::text[],
ADD COLUMN pitch_deck_images text[] DEFAULT '{}'::text[];

-- Update the existing items to have an empty array if they are somehow null
UPDATE public.case_studies SET gallery_images = '{}' WHERE gallery_images IS NULL;
UPDATE public.case_studies SET pitch_deck_images = '{}' WHERE pitch_deck_images IS NULL;
