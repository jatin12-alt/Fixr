-- Add AI analysis columns to pipeline_runs table
-- Run this manually in Neon dashboard or via node script

ALTER TABLE pipeline_runs 
ADD COLUMN IF NOT EXISTS ai_explanation text;

ALTER TABLE pipeline_runs 
ADD COLUMN IF NOT EXISTS ai_fix_suggestion text;

ALTER TABLE pipeline_runs 
ADD COLUMN IF NOT EXISTS ai_code_fix text;

ALTER TABLE pipeline_runs 
ADD COLUMN IF NOT EXISTS ai_severity text;

ALTER TABLE pipeline_runs 
ADD COLUMN IF NOT EXISTS ai_category text;

ALTER TABLE pipeline_runs 
ADD COLUMN IF NOT EXISTS ai_confidence integer;

-- Verify columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'pipeline_runs' 
AND column_name LIKE 'ai_%'
ORDER BY ordinal_position;
