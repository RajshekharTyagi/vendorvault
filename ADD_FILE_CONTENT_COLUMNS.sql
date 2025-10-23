-- Add file content, size, and review columns to existing documents table
-- Run this in your Supabase SQL Editor

-- Add new columns to store file content, size, and review information
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS file_content TEXT,
ADD COLUMN IF NOT EXISTS file_size BIGINT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;

-- Verify the table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'documents' 
ORDER BY ordinal_position;