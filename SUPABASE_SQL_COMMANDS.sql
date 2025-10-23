-- =====================================================
-- SUPABASE SQL EDITOR COMMANDS
-- Copy and paste these commands into your Supabase SQL Editor
-- =====================================================

-- Step 1: Drop existing documents table and recreate it properly
DROP TABLE IF EXISTS documents CASCADE;

-- Step 2: Create a clean documents table without foreign key constraints
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_content TEXT, -- Base64 encoded file content
  file_size BIGINT, -- File size in bytes
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'verified', 'rejected')),
  expires_on DATE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better performance
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Step 4: Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Step 5: Create a simple policy that allows all operations (for demo)
CREATE POLICY "Allow all operations on documents" ON documents
  FOR ALL USING (true);

-- Step 6: Grant necessary permissions
GRANT ALL ON documents TO anon;
GRANT ALL ON documents TO authenticated;
GRANT ALL ON SEQUENCE documents_id_seq TO anon;
GRANT ALL ON SEQUENCE documents_id_seq TO authenticated;

-- Step 7: Create checks table for compliance checklist
CREATE TABLE IF NOT EXISTS checks (
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

-- Create indexes for checks table
CREATE INDEX IF NOT EXISTS idx_checks_vendor_id ON checks(vendor_id);
CREATE INDEX IF NOT EXISTS idx_checks_status ON checks(status);
CREATE INDEX IF NOT EXISTS idx_checks_due_date ON checks(due_date);

-- Enable Row Level Security for checks
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;

-- Create policy for checks
CREATE POLICY IF NOT EXISTS "Allow all operations on checks" ON checks
  FOR ALL USING (true);

-- Grant permissions for checks
GRANT ALL ON checks TO anon;
GRANT ALL ON checks TO authenticated;
GRANT ALL ON SEQUENCE checks_id_seq TO anon;
GRANT ALL ON SEQUENCE checks_id_seq TO authenticated;

-- Step 8: Insert test data
INSERT INTO documents (vendor_id, uploaded_by, name, file_url, file_type, status)
VALUES ('demo-vendor', 'demo-user', 'Test_Setup_Document.pdf', '/uploads/test.pdf', 'application/pdf', 'uploaded');

INSERT INTO checks (vendor_id, check_name, status, comments, due_date)
VALUES 
  ('demo-vendor', 'Business License', 'approved', 'Valid until 2025', '2025-12-31'),
  ('demo-vendor', 'ISO 27001 Certification', 'pending', 'Awaiting renewal documentation', '2024-03-15'),
  ('demo-vendor', 'Insurance Certificate', 'rejected', 'Coverage amount insufficient', '2024-02-28');

-- Step 9: Verify tables were created successfully
SELECT 'Documents:' as table_name, COUNT(*) as count FROM documents
UNION ALL
SELECT 'Checks:' as table_name, COUNT(*) as count FROM checks;