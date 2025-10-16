-- =============================================
-- VendorVault Database Setup - Step 3
-- Create Indexes for Performance
-- =============================================

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Vendors table indexes
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_created_by ON vendors(created_by);
CREATE INDEX idx_vendors_name_trgm ON vendors USING gin(name gin_trgm_ops);
CREATE INDEX idx_vendors_email_trgm ON vendors USING gin(contact_email gin_trgm_ops);

-- Documents table indexes
CREATE INDEX idx_documents_vendor_id ON documents(vendor_id);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
CREATE INDEX idx_documents_status ON documents(status);
CREATE INDEX idx_documents_expires_on ON documents(expires_on);
CREATE INDEX idx_documents_name_trgm ON documents USING gin(name gin_trgm_ops);

-- Checks table indexes
CREATE INDEX idx_checks_vendor_id ON checks(vendor_id);
CREATE INDEX idx_checks_status ON checks(status);
CREATE INDEX idx_checks_checked_by ON checks(checked_by);
CREATE INDEX idx_checks_due_date ON checks(due_date);

-- Renewals table indexes
CREATE INDEX idx_renewals_vendor_id ON renewals(vendor_id);
CREATE INDEX idx_renewals_document_id ON renewals(document_id);
CREATE INDEX idx_renewals_status ON renewals(status);
CREATE INDEX idx_renewals_renewal_date ON renewals(renewal_date);

-- AI embeddings table indexes
CREATE INDEX idx_ai_embeddings_vendor_id ON ai_embeddings(vendor_id);
CREATE INDEX idx_ai_embeddings_document_id ON ai_embeddings(document_id);
-- Vector similarity search index
CREATE INDEX ai_embeddings_embedding_idx ON ai_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- AI threads table indexes
CREATE INDEX idx_ai_threads_vendor_id ON ai_threads(vendor_id);
CREATE INDEX idx_ai_threads_user_id ON ai_threads(user_id);
CREATE INDEX idx_ai_threads_created_at ON ai_threads(created_at);

-- System logs table indexes
CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_entity_type ON system_logs(entity_type);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at);