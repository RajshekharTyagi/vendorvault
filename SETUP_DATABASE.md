# Database Setup Instructions

## Step 1: Create Documents Table

Go to your Supabase dashboard → SQL Editor and run this SQL:

```sql
-- Drop existing table if it exists (optional)
DROP TABLE IF EXISTS documents CASCADE;

-- Create documents table
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  vendor_id TEXT NOT NULL,
  uploaded_by TEXT NOT NULL,
  name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'verified', 'rejected')),
  expires_on DATE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_created_at ON documents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
CREATE POLICY "Allow all operations on documents" ON documents
  FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON documents TO anon;
GRANT ALL ON documents TO authenticated;
GRANT ALL ON SEQUENCE documents_id_seq TO anon;
GRANT ALL ON SEQUENCE documents_id_seq TO authenticated;
```

## Step 2: Verify Table Creation

Run this query to verify the table was created successfully:

```sql
SELECT * FROM documents LIMIT 1;
```

## Step 3: Test Document Upload

After running the SQL above, your document upload feature should work properly and persist data across page reloads and sign-ins.

## Features

- ✅ Documents are stored permanently in the database
- ✅ No fake/sample data is shown
- ✅ Documents persist across page reloads
- ✅ Documents persist across sign-out/sign-in
- ✅ Proper error handling for database operations
- ✅ Clean UI without localStorage dependencies