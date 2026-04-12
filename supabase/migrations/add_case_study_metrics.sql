-- ═══════════════════════════════════════════════════
-- ADD METRICS JSONB COLUMN TO CASE_STUDIES
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════

-- Add the metrics column (array of {label, value, suffix} objects)
ALTER TABLE public.case_studies 
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '[]'::jsonb;

-- Add a comment for documentation
COMMENT ON COLUMN public.case_studies.metrics IS 'Array of KPI metric objects: [{label: string, value: string, suffix?: string, prefix?: string}]';

-- ═══════════════════════════════════════════════════
-- SEED: Populate existing case studies with real metrics
-- Adjust the WHERE clauses to match your actual slugs
-- ═══════════════════════════════════════════════════

-- Autonomous Credit Assessment Engine
UPDATE public.case_studies 
SET metrics = '[
  {"label": "Processing Speed", "value": "1200", "suffix": "apps/hr"},
  {"label": "Default Prediction Accuracy", "value": "97.3", "suffix": "%"},
  {"label": "Manual Review Reduction", "value": "82", "suffix": "%"},
  {"label": "Time to Decision", "value": "< 4", "suffix": "sec"}
]'::jsonb
WHERE slug = 'autonomous-credit-assessment-engine';

-- Multi-Region Healthcare Platform
UPDATE public.case_studies 
SET metrics = '[
  {"label": "Uptime SLA", "value": "99.99", "suffix": "%"},
  {"label": "Regions Deployed", "value": "12", "suffix": ""},
  {"label": "Patient Records Synced", "value": "4.2", "suffix": "M"},
  {"label": "Latency (p99)", "value": "< 180", "suffix": "ms"}
]'::jsonb
WHERE slug = 'multi-region-healthcare-platform';

-- Unified SEO/AEO/GEO Engine
UPDATE public.case_studies 
SET metrics = '[
  {"label": "Organic Traffic Increase", "value": "340", "suffix": "%"},
  {"label": "Keywords in Top 10", "value": "2,847", "suffix": ""},
  {"label": "Core Web Vitals Score", "value": "98", "suffix": "/100"},
  {"label": "Revenue from Search", "value": "1.8", "suffix": "M"}
]'::jsonb
WHERE slug = 'unified-seo-aeo-geo-engine';

-- Real-Time Logistics Insight Engine
UPDATE public.case_studies 
SET metrics = '[
  {"label": "Fleet Vehicles Tracked", "value": "15,000", "suffix": "+"},
  {"label": "Delivery Time Improvement", "value": "31", "suffix": "%"},
  {"label": "Cost Reduction", "value": "2.4", "suffix": "M/yr"},
  {"label": "Real-Time Event Throughput", "value": "50K", "suffix": "evt/sec"}
]'::jsonb
WHERE slug = 'real-time-logistics-insight-engine';

-- Genomic Analysis Pipeline
UPDATE public.case_studies 
SET metrics = '[
  {"label": "Genome Processing Time", "value": "14", "suffix": "min"},
  {"label": "Variant Detection Accuracy", "value": "99.7", "suffix": "%"},
  {"label": "Samples Processed Monthly", "value": "12,000", "suffix": "+"},
  {"label": "Cost per Genome", "value": "$", "suffix": "3.20"}
]'::jsonb
WHERE slug = 'genomic-analysis-pipeline';
