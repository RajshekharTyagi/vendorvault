// User Types
export interface User {
  id: string;
  email: string;
  full_name: string;
  role_id: string;
  role?: Role;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: 'admin' | 'vendor' | 'auditor';
  description: string;
  created_at: string;
}

// Vendor Types
export interface Vendor {
  id: string;
  name: string;
  contact_email: string;
  category: string;
  status: 'active' | 'pending' | 'suspended';
  created_by: string;
  created_at: string;
  updated_at: string;
  documents?: Document[];
  checks?: Check[];
}

// Document Types
export interface Document {
  id: string;
  vendor_id: string;
  uploaded_by: string;
  name: string;
  file_url: string;
  file_type: string;
  status: 'uploaded' | 'verified' | 'rejected';
  expires_on?: string;
  remarks?: string;
  created_at: string;
  vendor?: { name: string };
}

// Compliance Check Types
export interface Check {
  id: string;
  vendor_id: string;
  check_name: string;
  status: 'pending' | 'approved' | 'rejected';
  evidence_url?: string;
  checked_by?: string;
  comments?: string;
  due_date?: string;
  created_at: string;
  vendor?: { name: string };
}

// Renewal Types
export interface Renewal {
  id: string;
  vendor_id: string;
  document_id: string;
  renewal_date: string;
  status: 'upcoming' | 'completed' | 'overdue';
  reminder_sent: boolean;
  created_at: string;
}

// AI Types
export interface AIEmbedding {
  id: string;
  vendor_id: string;
  document_id: string;
  chunk_text: string;
  embedding: number[];
  created_at: string;
}

export interface AIThread {
  id: string;
  vendor_id: string;
  user_id: string;
  question: string;
  answer: string;
  context_docs: Record<string, unknown>;
  created_at: string;
}

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalVendors: number;
  pendingApprovals: number;
  filesUploaded: number;
  checklistCompleted: number;
  upcomingRenewals: number;
}