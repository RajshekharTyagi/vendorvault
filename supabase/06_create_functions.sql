-- =============================================
-- VendorVault Database Setup - Step 6
-- Create Database Functions
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checks_updated_at BEFORE UPDATE ON checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_renewals_updated_at BEFORE UPDATE ON renewals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, full_name, role_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        (SELECT id FROM roles WHERE name = 'vendor' LIMIT 1) -- Default role
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to search documents using vector similarity
CREATE OR REPLACE FUNCTION match_documents(
    query_embedding vector(1536),
    match_count int DEFAULT 5,
    vendor_id_filter uuid DEFAULT NULL
)
RETURNS TABLE (
    id uuid,
    vendor_id uuid,
    document_id uuid,
    chunk_text text,
    similarity float
)
LANGUAGE sql STABLE
AS $$
    SELECT
        ai_embeddings.id,
        ai_embeddings.vendor_id,
        ai_embeddings.document_id,
        ai_embeddings.chunk_text,
        1 - (ai_embeddings.embedding <=> query_embedding) as similarity
    FROM ai_embeddings
    WHERE 
        CASE 
            WHEN vendor_id_filter IS NOT NULL THEN ai_embeddings.vendor_id = vendor_id_filter
            ELSE TRUE
        END
    ORDER BY ai_embeddings.embedding <=> query_embedding
    LIMIT match_count;
$$;

-- Function to get vendor compliance summary
CREATE OR REPLACE FUNCTION get_vendor_compliance_summary(vendor_uuid uuid)
RETURNS TABLE (
    vendor_id uuid,
    vendor_name text,
    total_checks int,
    approved_checks int,
    pending_checks int,
    rejected_checks int,
    compliance_percentage numeric,
    total_documents int,
    verified_documents int,
    pending_documents int,
    rejected_documents int,
    upcoming_renewals int
)
LANGUAGE sql STABLE
AS $$
    SELECT
        v.id as vendor_id,
        v.name as vendor_name,
        COALESCE(check_stats.total_checks, 0) as total_checks,
        COALESCE(check_stats.approved_checks, 0) as approved_checks,
        COALESCE(check_stats.pending_checks, 0) as pending_checks,
        COALESCE(check_stats.rejected_checks, 0) as rejected_checks,
        CASE 
            WHEN COALESCE(check_stats.total_checks, 0) = 0 THEN 0
            ELSE ROUND((COALESCE(check_stats.approved_checks, 0)::numeric / check_stats.total_checks::numeric) * 100, 2)
        END as compliance_percentage,
        COALESCE(doc_stats.total_documents, 0) as total_documents,
        COALESCE(doc_stats.verified_documents, 0) as verified_documents,
        COALESCE(doc_stats.pending_documents, 0) as pending_documents,
        COALESCE(doc_stats.rejected_documents, 0) as rejected_documents,
        COALESCE(renewal_stats.upcoming_renewals, 0) as upcoming_renewals
    FROM vendors v
    LEFT JOIN (
        SELECT
            vendor_id,
            COUNT(*) as total_checks,
            COUNT(*) FILTER (WHERE status = 'approved') as approved_checks,
            COUNT(*) FILTER (WHERE status = 'pending') as pending_checks,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected_checks
        FROM checks
        WHERE vendor_id = vendor_uuid
        GROUP BY vendor_id
    ) check_stats ON v.id = check_stats.vendor_id
    LEFT JOIN (
        SELECT
            vendor_id,
            COUNT(*) as total_documents,
            COUNT(*) FILTER (WHERE status = 'verified') as verified_documents,
            COUNT(*) FILTER (WHERE status = 'uploaded') as pending_documents,
            COUNT(*) FILTER (WHERE status = 'rejected') as rejected_documents
        FROM documents
        WHERE vendor_id = vendor_uuid
        GROUP BY vendor_id
    ) doc_stats ON v.id = doc_stats.vendor_id
    LEFT JOIN (
        SELECT
            vendor_id,
            COUNT(*) as upcoming_renewals
        FROM renewals
        WHERE vendor_id = vendor_uuid 
        AND renewal_date BETWEEN NOW() AND NOW() + INTERVAL '30 days'
        AND status = 'upcoming'
        GROUP BY vendor_id
    ) renewal_stats ON v.id = renewal_stats.vendor_id
    WHERE v.id = vendor_uuid;
$$;

-- Function to get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    total_vendors bigint,
    active_vendors bigint,
    pending_vendors bigint,
    suspended_vendors bigint,
    total_documents bigint,
    pending_approvals bigint,
    verified_documents bigint,
    rejected_documents bigint,
    total_checks bigint,
    approved_checks bigint,
    pending_checks bigint,
    rejected_checks bigint,
    upcoming_renewals bigint,
    overdue_renewals bigint
)
LANGUAGE sql STABLE
AS $$
    SELECT
        (SELECT COUNT(*) FROM vendors) as total_vendors,
        (SELECT COUNT(*) FROM vendors WHERE status = 'active') as active_vendors,
        (SELECT COUNT(*) FROM vendors WHERE status = 'pending') as pending_vendors,
        (SELECT COUNT(*) FROM vendors WHERE status = 'suspended') as suspended_vendors,
        (SELECT COUNT(*) FROM documents) as total_documents,
        (SELECT COUNT(*) FROM documents WHERE status = 'uploaded') as pending_approvals,
        (SELECT COUNT(*) FROM documents WHERE status = 'verified') as verified_documents,
        (SELECT COUNT(*) FROM documents WHERE status = 'rejected') as rejected_documents,
        (SELECT COUNT(*) FROM checks) as total_checks,
        (SELECT COUNT(*) FROM checks WHERE status = 'approved') as approved_checks,
        (SELECT COUNT(*) FROM checks WHERE status = 'pending') as pending_checks,
        (SELECT COUNT(*) FROM checks WHERE status = 'rejected') as rejected_checks,
        (SELECT COUNT(*) FROM renewals WHERE renewal_date BETWEEN NOW() AND NOW() + INTERVAL '30 days' AND status = 'upcoming') as upcoming_renewals,
        (SELECT COUNT(*) FROM renewals WHERE renewal_date < NOW() AND status = 'upcoming') as overdue_renewals;
$$;

-- Function to log system activities
CREATE OR REPLACE FUNCTION log_activity(
    p_user_id uuid,
    p_action text,
    p_entity_type text DEFAULT NULL,
    p_entity_id uuid DEFAULT NULL,
    p_details jsonb DEFAULT NULL,
    p_ip_address inet DEFAULT NULL,
    p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    log_id uuid;
BEGIN
    INSERT INTO system_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
    VALUES (p_user_id, p_action, p_entity_type, p_entity_id, p_details, p_ip_address, p_user_agent)
    RETURNING id INTO log_id;
    
    RETURN log_id;
END;
$$;