-- =============================================
-- VendorVault Database Setup - Step 1
-- Enable Required Extensions
-- =============================================

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Enable pg_trgm for text search improvements
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enable unaccent for better text search
CREATE EXTENSION IF NOT EXISTS unaccent;