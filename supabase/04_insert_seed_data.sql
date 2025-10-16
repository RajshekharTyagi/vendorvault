-- =============================================
-- VendorVault Database Setup - Step 4
-- Insert Seed Data
-- =============================================

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin', 'Full system access and management'),
    ('550e8400-e29b-41d4-a716-446655440002', 'vendor', 'Limited access to own vendor data'),
    ('550e8400-e29b-41d4-a716-446655440003', 'auditor', 'Read-only access for compliance review');

-- Insert default permissions
INSERT INTO permissions (id, name, description) VALUES
    ('660e8400-e29b-41d4-a716-446655440001', 'create_vendor', 'Create new vendor profiles'),
    ('660e8400-e29b-41d4-a716-446655440002', 'edit_vendor', 'Edit vendor information'),
    ('660e8400-e29b-41d4-a716-446655440003', 'delete_vendor', 'Delete vendor profiles'),
    ('660e8400-e29b-41d4-a716-446655440004', 'view_all_vendors', 'View all vendor profiles'),
    ('660e8400-e29b-41d4-a716-446655440005', 'upload_document', 'Upload compliance documents'),
    ('660e8400-e29b-41d4-a716-446655440006', 'approve_document', 'Approve or reject documents'),
    ('660e8400-e29b-41d4-a716-446655440007', 'view_all_documents', 'View all documents'),
    ('660e8400-e29b-41d4-a716-446655440008', 'manage_checklist', 'Manage compliance checklists'),
    ('660e8400-e29b-41d4-a716-446655440009', 'use_ai_assistant', 'Access AI assistant features'),
    ('660e8400-e29b-41d4-a716-446655440010', 'view_analytics', 'View system analytics'),
    ('660e8400-e29b-41d4-a716-446655440011', 'manage_users', 'Manage user accounts'),
    ('660e8400-e29b-41d4-a716-446655440012', 'system_settings', 'Access system settings');

-- Assign permissions to roles
-- Admin permissions (all permissions)
INSERT INTO role_permissions (role_id, permission_id) 
SELECT '550e8400-e29b-41d4-a716-446655440001', id FROM permissions;

-- Vendor permissions (limited)
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440005'), -- upload_document
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440009'), -- use_ai_assistant
    ('550e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440008'); -- manage_checklist (own only)

-- Auditor permissions (read-only)
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440004'), -- view_all_vendors
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440007'), -- view_all_documents
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440009'), -- use_ai_assistant
    ('550e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440010'); -- view_analytics

-- Insert sample vendor categories (for reference)
COMMENT ON COLUMN vendors.category IS 'Common categories: IT Services, Finance, Logistics, Marketing, Legal, Consulting, Manufacturing, Security, Cloud Services, Analytics, Networking';

-- Insert default compliance checklist items (as comments for reference)
COMMENT ON TABLE checks IS 'Common compliance items: Business License, ISO 27001 Certification, Insurance Certificate, Data Privacy Policy, Financial Statements, Security Compliance Audit, Tax Certificate, Terms of Service, SLA, Business Continuity Plan';