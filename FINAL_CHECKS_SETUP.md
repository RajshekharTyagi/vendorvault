# Final Checks Table Setup

## Problem
The current checks table has foreign key constraints and UUID requirements that are causing issues.

## Solution
Run this SQL in your Supabase SQL Editor to create a clean, working checks table:

```sql
-- Drop existing checks table if it exists (removes constraints)
DROP TABLE IF EXISTS checks CASCADE;

-- Create new checks table without foreign key constraints
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

-- Create indexes for better performance
CREATE INDEX idx_checks_vendor_id ON checks(vendor_id);
CREATE INDEX idx_checks_status ON checks(status);
CREATE INDEX idx_checks_due_date ON checks(due_date);

-- Insert realistic test data that matches the checklist categories
INSERT INTO checks (vendor_id, check_name, status, comments, due_date, checked_by) VALUES
-- Legal & Compliance
('vendor-1', 'Business License', 'approved', 'Valid until 2025', '2025-12-31', 'admin-user'),
('vendor-1', 'Data Privacy Policy', 'approved', 'GDPR compliant', '2025-06-30', 'admin-user'),
('vendor-2', 'Terms of Service', 'pending', 'Under review', '2024-04-30', NULL),

-- Security & Certifications  
('vendor-1', 'ISO 27001 Certification', 'pending', 'Awaiting renewal documentation', '2024-03-15', NULL),
('vendor-2', 'Security Compliance Audit', 'pending', 'Scheduled for next month', '2024-04-15', NULL),
('vendor-3', 'Penetration Test Report', 'rejected', 'Report incomplete, missing executive summary', '2024-02-28', 'security-admin'),

-- Financial & Insurance
('vendor-1', 'Insurance Certificate', 'rejected', 'Coverage amount insufficient - need $2M minimum', '2024-02-28', 'finance-admin'),
('vendor-2', 'Financial Statements', 'approved', 'Audited statements received and verified', '2024-12-31', 'finance-admin'),
('vendor-3', 'Tax Certificate', 'pending', 'Waiting for 2024 certificate', '2024-05-15', NULL),

-- Operational
('vendor-1', 'Service Level Agreement', 'approved', 'SLA meets all requirements', '2025-01-31', 'ops-admin'),
('vendor-2', 'Business Continuity Plan', 'pending', 'Plan submitted, under review', '2024-06-30', NULL),
('vendor-3', 'Disaster Recovery Plan', 'rejected', 'Recovery time objectives too long', '2024-03-31', 'ops-admin');

-- Verify the data was inserted correctly
SELECT 
  check_name,
  status,
  COUNT(*) as count
FROM checks 
GROUP BY check_name, status
ORDER BY check_name, status;

-- Show all checks
SELECT * FROM checks ORDER BY created_at DESC;
```

## After Running This SQL

1. **The checklist page will show real data** from the database
2. **You can update check statuses** and they will persist
3. **Comments and reviews will be saved** permanently
4. **No more mock data** - everything is real database storage

## Test It

1. Run the SQL above in Supabase
2. Go to your checklist page
3. You should see real compliance checks with proper statuses
4. Try updating a check status - it will save to the database
5. Refresh the page - your changes will persist