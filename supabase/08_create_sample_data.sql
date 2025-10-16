-- =============================================
-- VendorVault Database Setup - Step 8
-- Insert Sample Data for Testing
-- =============================================

-- Note: This file contains sample data for testing purposes
-- You can skip this file if you don't want sample data

-- Insert sample users (these will be created when users sign up via Supabase Auth)
-- This is just for reference - actual users are created through the auth system

-- Sample vendors
INSERT INTO vendors (id, name, contact_email, category, status, created_by) VALUES
    ('11111111-1111-1111-1111-111111111111', 'TechCorp Solutions', 'contact@techcorp.com', 'IT Services', 'active', NULL),
    ('22222222-2222-2222-2222-222222222222', 'SecureData Inc', 'info@securedata.com', 'Security', 'pending', NULL),
    ('33333333-3333-3333-3333-333333333333', 'CloudFirst Ltd', 'hello@cloudfirst.com', 'Cloud Services', 'active', NULL),
    ('44444444-4444-4444-4444-444444444444', 'DataFlow Systems', 'support@dataflow.com', 'Analytics', 'suspended', NULL),
    ('55555555-5555-5555-5555-555555555555', 'NetworkPro Services', 'admin@networkpro.com', 'Networking', 'active', NULL);

-- Sample documents
INSERT INTO documents (id, vendor_id, name, file_url, file_type, status, expires_on, remarks) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'ISO_27001_Certificate.pdf', '/documents/iso-cert.pdf', 'application/pdf', 'verified', '2024-12-31', 'Valid certification'),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Business_License.pdf', '/documents/business-license.pdf', 'application/pdf', 'uploaded', NULL, NULL),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Insurance_Certificate.pdf', '/documents/insurance.pdf', 'application/pdf', 'rejected', NULL, 'Document expired, please upload current version'),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Privacy_Policy.pdf', '/documents/privacy-policy.pdf', 'application/pdf', 'verified', NULL, 'GDPR compliant'),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'Financial_Statements.pdf', '/documents/financial.pdf', 'application/pdf', 'uploaded', NULL, NULL);

-- Sample compliance checks
INSERT INTO checks (id, vendor_id, check_name, status, evidence_url, comments, due_date) VALUES
    ('aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Business License', 'approved', '/documents/business-license.pdf', 'Valid license, expires 2025', '2024-12-31'),
    ('aaaaaaaa-2222-2222-2222-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'ISO 27001 Certification', 'approved', '/documents/iso-cert.pdf', 'Current certification valid', NULL),
    ('aaaaaaaa-3333-3333-3333-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Insurance Certificate', 'pending', NULL, NULL, NULL),
    ('aaaaaaaa-4444-4444-4444-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Data Privacy Policy', 'rejected', NULL, 'Policy outdated, needs GDPR compliance update', NULL),
    ('aaaaaaaa-5555-5555-5555-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Financial Statements', 'pending', NULL, NULL, '2024-02-15'),
    ('aaaaaaaa-6666-6666-6666-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Security Compliance Audit', 'pending', NULL, NULL, NULL),
    
    ('bbbbbbbb-1111-1111-1111-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Business License', 'approved', NULL, 'Valid license', NULL),
    ('bbbbbbbb-2222-2222-2222-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Insurance Certificate', 'rejected', '/documents/insurance.pdf', 'Document expired', NULL),
    ('bbbbbbbb-3333-3333-3333-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'Data Privacy Policy', 'pending', NULL, NULL, NULL),
    
    ('cccccccc-1111-1111-1111-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Business License', 'approved', NULL, 'Valid license', NULL),
    ('cccccccc-2222-2222-2222-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'Data Privacy Policy', 'approved', '/documents/privacy-policy.pdf', 'GDPR compliant', NULL),
    ('cccccccc-3333-3333-3333-cccccccccccc', '33333333-3333-3333-3333-333333333333', 'ISO 27001 Certification', 'pending', NULL, NULL, NULL);

-- Sample renewals
INSERT INTO renewals (id, vendor_id, document_id, renewal_date, status, reminder_sent) VALUES
    ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-12-31', 'upcoming', false),
    ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-02-15', 'upcoming', false),
    ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-03-01', 'upcoming', false);

-- Sample AI threads (chat history)
-- Note: These would normally be created through the application
INSERT INTO ai_threads (id, vendor_id, user_id, question, answer, context_docs) VALUES
    ('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', NULL, 'What documents are missing for TechCorp Solutions?', 'Based on the compliance checklist, TechCorp Solutions is missing: Insurance Certificate (pending), and needs to update their Data Privacy Policy (rejected - requires GDPR compliance update).', '{"sources": ["compliance_checklist", "document_status"]}'),
    ('b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', NULL, 'What is the compliance status of SecureData Inc?', 'SecureData Inc has a mixed compliance status: Business License is approved, but their Insurance Certificate was rejected due to expiration, and their Data Privacy Policy is still pending review.', '{"sources": ["vendor_profile", "document_status"]}');

-- Sample system logs
INSERT INTO system_logs (id, user_id, action, entity_type, entity_id, details) VALUES
    ('c1111111-1111-1111-1111-111111111111', NULL, 'vendor_created', 'vendor', '11111111-1111-1111-1111-111111111111', '{"vendor_name": "TechCorp Solutions", "category": "IT Services"}'),
    ('c2222222-2222-2222-2222-222222222222', NULL, 'document_uploaded', 'document', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"document_name": "ISO_27001_Certificate.pdf", "vendor_id": "11111111-1111-1111-1111-111111111111"}'),
    ('c3333333-3333-3333-3333-333333333333', NULL, 'document_approved', 'document', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"document_name": "ISO_27001_Certificate.pdf", "status": "verified"}'),
    ('c4444444-4444-4444-4444-444444444444', NULL, 'check_updated', 'check', 'aaaaaaaa-1111-1111-1111-aaaaaaaaaaaa', '{"check_name": "Business License", "status": "approved"}');

-- Create a view for easy vendor compliance overview
CREATE OR REPLACE VIEW vendor_compliance_overview AS
SELECT 
    v.id,
    v.name,
    v.contact_email,
    v.category,
    v.status,
    v.created_at,
    COUNT(c.id) as total_checks,
    COUNT(c.id) FILTER (WHERE c.status = 'approved') as approved_checks,
    COUNT(c.id) FILTER (WHERE c.status = 'pending') as pending_checks,
    COUNT(c.id) FILTER (WHERE c.status = 'rejected') as rejected_checks,
    CASE 
        WHEN COUNT(c.id) = 0 THEN 0
        ELSE ROUND((COUNT(c.id) FILTER (WHERE c.status = 'approved')::numeric / COUNT(c.id)::numeric) * 100, 2)
    END as compliance_percentage,
    COUNT(d.id) as total_documents,
    COUNT(d.id) FILTER (WHERE d.status = 'verified') as verified_documents,
    COUNT(d.id) FILTER (WHERE d.status = 'uploaded') as pending_documents,
    COUNT(d.id) FILTER (WHERE d.status = 'rejected') as rejected_documents,
    COUNT(r.id) FILTER (WHERE r.renewal_date BETWEEN NOW() AND NOW() + INTERVAL '30 days') as upcoming_renewals
FROM vendors v
LEFT JOIN checks c ON v.id = c.vendor_id
LEFT JOIN documents d ON v.id = d.vendor_id
LEFT JOIN renewals r ON v.id = r.vendor_id AND r.status = 'upcoming'
GROUP BY v.id, v.name, v.contact_email, v.category, v.status, v.created_at
ORDER BY v.name;