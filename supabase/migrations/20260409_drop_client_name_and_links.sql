-- Drop client_name, live_url, and github_url columns from case_studies table
ALTER TABLE case_studies DROP COLUMN IF EXISTS client_name;
ALTER TABLE case_studies DROP COLUMN IF EXISTS live_url;
ALTER TABLE case_studies DROP COLUMN IF EXISTS github_url;
