-- Create vendors table
CREATE TABLE IF NOT EXISTS vendors (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    category VARCHAR(100) DEFAULT 'Other',
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_created_at ON vendors(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read all vendors
CREATE POLICY "Allow authenticated users to read vendors" ON vendors
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to insert vendors
CREATE POLICY "Allow authenticated users to insert vendors" ON vendors
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to update vendors
CREATE POLICY "Allow authenticated users to update vendors" ON vendors
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Create policy to allow authenticated users to delete vendors
CREATE POLICY "Allow authenticated users to delete vendors" ON vendors
    FOR DELETE USING (auth.role() = 'authenticated');

-- Insert some sample vendors for testing
INSERT INTO vendors (name, contact_email, category, status) VALUES
    ('testing', 'test@example.com', 'Logistics', 'active'),
    ('Rajshekhar Tyagi', 'raj@example.com', 'Logistics', 'pending'),
    ('Test Vendor Company', 'contact@testvendor.com', 'IT Services', 'active')
ON CONFLICT DO NOTHING;

-- Verify the table was created
SELECT 'Vendors table created successfully' as status;