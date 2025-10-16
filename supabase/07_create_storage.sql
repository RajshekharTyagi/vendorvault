-- =============================================
-- VendorVault Database Setup - Step 7
-- Create Storage Buckets and Policies
-- =============================================

-- Create storage bucket for vendor documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'vendor-documents',
    'vendor-documents',
    false,
    10485760, -- 10MB limit
    ARRAY[
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/jpg',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ]
);

-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB limit
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/jpg',
        'image/webp'
    ]
);

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- Vendor documents bucket policies
-- Users can upload documents for their vendors
CREATE POLICY "Users can upload vendor documents" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'vendor-documents' AND
        (
            -- Vendors can upload to their own folder
            (auth.uid()::text = (storage.foldername(name))[1]) OR
            -- Admins can upload anywhere
            EXISTS (
                SELECT 1 FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = auth.uid() AND r.name = 'admin'
            )
        )
    );

-- Users can view documents they have access to
CREATE POLICY "Users can view accessible documents" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'vendor-documents' AND
        (
            -- Users can view their own vendor documents
            EXISTS (
                SELECT 1 FROM vendors v
                JOIN users u ON u.email = v.contact_email
                WHERE u.id = auth.uid() AND v.id::text = (storage.foldername(name))[1]
            ) OR
            -- Admins and auditors can view all documents
            EXISTS (
                SELECT 1 FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = auth.uid() AND r.name IN ('admin', 'auditor')
            )
        )
    );

-- Users can update their own documents, admins can update all
CREATE POLICY "Users can update accessible documents" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'vendor-documents' AND
        (
            -- Users can update their own vendor documents
            EXISTS (
                SELECT 1 FROM vendors v
                JOIN users u ON u.email = v.contact_email
                WHERE u.id = auth.uid() AND v.id::text = (storage.foldername(name))[1]
            ) OR
            -- Admins can update all documents
            EXISTS (
                SELECT 1 FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = auth.uid() AND r.name = 'admin'
            )
        )
    );

-- Users can delete their own documents, admins can delete all
CREATE POLICY "Users can delete accessible documents" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'vendor-documents' AND
        (
            -- Users can delete their own vendor documents
            EXISTS (
                SELECT 1 FROM vendors v
                JOIN users u ON u.email = v.contact_email
                WHERE u.id = auth.uid() AND v.id::text = (storage.foldername(name))[1]
            ) OR
            -- Admins can delete all documents
            EXISTS (
                SELECT 1 FROM users u 
                JOIN roles r ON u.role_id = r.id 
                WHERE u.id = auth.uid() AND r.name = 'admin'
            )
        )
    );

-- Avatar bucket policies
-- Users can upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Anyone can view avatars (public bucket)
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Users can update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Users can delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'avatars' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );