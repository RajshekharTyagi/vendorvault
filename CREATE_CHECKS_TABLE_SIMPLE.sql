-- Simple checks table creation without RLS complications
-- Run this in your Supabase SQL Editor

-- Drop existing checks table if it exists
DROP TABLE IF EXISTS checks CASCADE;

-- Create checks table
CREATE TABLE checks (
  id SERIAL PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  check_name TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  evidence_url TEXT,
  checked_by TEXT,
  comments TEXT,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_checks_vendor_id ON checks(vendor_id);
CREATE INDEX idx_checks_status ON checks(status);
CREATE INDEX idx_checks_due_date ON checks(due_date);

-- Insert some initial test data
INSERT INTO checks (vendor_id, check_name, status, comments, due_date) VALUES
('vendor-1', 'Business License', 'approved', 'Valid until 2025', '2025-12-31'),
('vendor-1', 'Data Privacy Policy', 'approved', 'GDPR compliant', '2025-06-30'),
('vendor-1', 'Terms of Service', 'pending', NULL, '2024-04-30'),
('vendor-2', 'ISO 27001 Certification', 'pending', 'Awaiting renewal documentation', '2024-03-15'),
('vendor-2', 'Security Compliance Audit', 'pending', 'Scheduled for next month', '2024-04-15'),
('vendor-2', 'Penetration Test Report', 'rejected', 'Report incomplete', '2024-02-28'),
('vendor-3', 'Insurance Certificate', 'rejected', 'Coverage amount insufficient', '2024-02-28'),
('vendor-3', 'Financial Statements', 'approved', 'Audited statements received', '2024-12-31'),
('vendor-3', 'Tax Certificate', 'pending', 'Waiting for 2024 certificate', '2024-05-15');

-- Verify the table was created and populated
SELECT 
  check_name,
  status,
  COUNT(*) as count
FROM checks 
GROUP BY check_name, status
ORDER BY check_name, status;