-- =============================================
-- VendorVault Database Setup - Step 5
-- Row Level Security (RLS) Policies
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Admins can view all users
CREATE POLICY "Admins can view all users" ON users
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- =============================================
-- VENDORS TABLE POLICIES
-- =============================================

-- Vendors can view their own vendor profile
CREATE POLICY "Vendors can view own profile" ON vendors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            WHERE u.id = auth.uid() AND u.email = vendors.contact_email
        )
    );

-- Admins and auditors can view all vendors
CREATE POLICY "Admins and auditors can view all vendors" ON vendors
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name IN ('admin', 'auditor')
        )
    );

-- Admins can insert, update, delete vendors
CREATE POLICY "Admins can manage vendors" ON vendors
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- =============================================
-- DOCUMENTS TABLE POLICIES
-- =============================================

-- Users can view documents for their vendors
CREATE POLICY "Users can view vendor documents" ON documents
    FOR SELECT USING (
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN users u ON u.email = v.contact_email
            WHERE u.id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name IN ('admin', 'auditor')
        )
    );

-- Vendors can upload documents for their profile
CREATE POLICY "Vendors can upload documents" ON documents
    FOR INSERT WITH CHECK (
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN users u ON u.email = v.contact_email
            WHERE u.id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- Admins can update and delete documents
CREATE POLICY "Admins can manage documents" ON documents
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- =============================================
-- CHECKS TABLE POLICIES
-- =============================================

-- Users can view checks for their vendors
CREATE POLICY "Users can view vendor checks" ON checks
    FOR SELECT USING (
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN users u ON u.email = v.contact_email
            WHERE u.id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name IN ('admin', 'auditor')
        )
    );

-- Vendors can update their own checks
CREATE POLICY "Vendors can update own checks" ON checks
    FOR UPDATE USING (
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN users u ON u.email = v.contact_email
            WHERE u.id = auth.uid()
        )
    );

-- Admins can manage all checks
CREATE POLICY "Admins can manage checks" ON checks
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- =============================================
-- RENEWALS TABLE POLICIES
-- =============================================

-- Users can view renewals for their vendors
CREATE POLICY "Users can view vendor renewals" ON renewals
    FOR SELECT USING (
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN users u ON u.email = v.contact_email
            WHERE u.id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name IN ('admin', 'auditor')
        )
    );

-- Admins can manage renewals
CREATE POLICY "Admins can manage renewals" ON renewals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- =============================================
-- AI_EMBEDDINGS TABLE POLICIES
-- =============================================

-- Users can view embeddings for their vendors
CREATE POLICY "Users can view vendor embeddings" ON ai_embeddings
    FOR SELECT USING (
        vendor_id IN (
            SELECT v.id FROM vendors v
            JOIN users u ON u.email = v.contact_email
            WHERE u.id = auth.uid()
        )
        OR
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name IN ('admin', 'auditor')
        )
    );

-- System can insert embeddings (service role)
CREATE POLICY "System can manage embeddings" ON ai_embeddings
    FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- AI_THREADS TABLE POLICIES
-- =============================================

-- Users can view their own AI conversations
CREATE POLICY "Users can view own AI threads" ON ai_threads
    FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own AI conversations
CREATE POLICY "Users can create AI threads" ON ai_threads
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all AI threads
CREATE POLICY "Admins can view all AI threads" ON ai_threads
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- =============================================
-- SYSTEM_LOGS TABLE POLICIES
-- =============================================

-- Only admins can view system logs
CREATE POLICY "Admins can view system logs" ON system_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users u 
            JOIN roles r ON u.role_id = r.id 
            WHERE u.id = auth.uid() AND r.name = 'admin'
        )
    );

-- System can insert logs (service role)
CREATE POLICY "System can insert logs" ON system_logs
    FOR INSERT WITH CHECK (auth.role() = 'service_role');