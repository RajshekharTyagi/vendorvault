# VendorVault Database Setup

This directory contains SQL files to set up your VendorVault database in Supabase. Execute these files in order in your Supabase SQL Editor.

## 📋 Setup Instructions

### 1. Prerequisites
- Supabase project created
- Access to Supabase SQL Editor
- Admin access to your Supabase project

### 2. Execution Order

Execute the SQL files in the following order:

#### Step 1: Enable Extensions
```sql
-- File: 01_enable_extensions.sql
-- Enables required PostgreSQL extensions
```

#### Step 2: Create Tables
```sql
-- File: 02_create_tables.sql
-- Creates all core tables for VendorVault
```

#### Step 3: Create Indexes
```sql
-- File: 03_create_indexes.sql
-- Creates performance indexes
```

#### Step 4: Insert Seed Data
```sql
-- File: 04_insert_seed_data.sql
-- Inserts roles, permissions, and default data
```

#### Step 5: Create RLS Policies
```sql
-- File: 05_create_rls_policies.sql
-- Sets up Row Level Security policies
```

#### Step 6: Create Functions
```sql
-- File: 06_create_functions.sql
-- Creates database functions and triggers
```

#### Step 7: Create Storage
```sql
-- File: 07_create_storage.sql
-- Sets up Supabase Storage buckets and policies
```

#### Step 8: Create Sample Data (Optional)
```sql
-- File: 08_create_sample_data.sql
-- Inserts sample data for testing (optional)
```

## 🗄️ Database Schema Overview

### Core Tables
- **users** - User profiles (extends Supabase auth.users)
- **roles** - User roles (admin, vendor, auditor)
- **permissions** - System permissions
- **role_permissions** - Role-permission mapping
- **vendors** - Vendor profiles and information
- **documents** - Document metadata and status
- **checks** - Compliance checklist items
- **renewals** - Document renewal tracking

### AI Tables
- **ai_embeddings** - Vector embeddings for RAG
- **ai_threads** - AI chat history

### System Tables
- **system_logs** - Audit trail and activity logs

### Storage Buckets
- **vendor-documents** - Stores uploaded compliance documents
- **avatars** - User profile pictures

## 🔐 Security Features

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Admins have full access
- Auditors have read-only access

### Storage Security
- Document access restricted by vendor ownership
- File type and size restrictions
- Secure file URLs

## 🚀 Quick Setup Commands

Copy and paste each file's content into your Supabase SQL Editor in order:

1. **Extensions**: Copy `01_enable_extensions.sql` → Run
2. **Tables**: Copy `02_create_tables.sql` → Run
3. **Indexes**: Copy `03_create_indexes.sql` → Run
4. **Seed Data**: Copy `04_insert_seed_data.sql` → Run
5. **RLS Policies**: Copy `05_create_rls_policies.sql` → Run
6. **Functions**: Copy `06_create_functions.sql` → Run
7. **Storage**: Copy `07_create_storage.sql` → Run
8. **Sample Data** (Optional): Copy `08_create_sample_data.sql` → Run

## 🧪 Testing the Setup

After running all scripts, you can test with these queries:

```sql
-- Check if all tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check roles and permissions
SELECT r.name, COUNT(rp.permission_id) as permission_count
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
GROUP BY r.id, r.name;

-- Check storage buckets
SELECT * FROM storage.buckets;

-- Test vector search function
SELECT * FROM match_documents(
    '[0.1, 0.2, 0.3]'::vector, -- dummy vector
    5
);
```

## 🔧 Environment Variables

Make sure your `.env.local` has these values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENROUTER_API_KEY=your-openrouter-api-key
VECTOR_TABLE_NAME=ai_embeddings
```

## 📞 Support

If you encounter any issues:
1. Check the Supabase logs for error details
2. Ensure all extensions are properly installed
3. Verify your Supabase project has the required permissions
4. Check that pgvector extension is available in your Supabase instance

## 🎯 Next Steps

After database setup:
1. Update your `.env.local` with Supabase credentials
2. Test the application login
3. Create your first vendor
4. Upload a test document
5. Try the AI assistant features

Your VendorVault database is now ready! 🚀