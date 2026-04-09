-- Add project_length column to case_studies table
ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS project_length text;
