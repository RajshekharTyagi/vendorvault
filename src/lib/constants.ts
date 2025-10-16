// App Constants
export const APP_NAME = 'VendorVault';
export const APP_DESCRIPTION = 'Your secure space for vendor compliance management';

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  VENDOR: 'vendor',
  AUDITOR: 'auditor',
} as const;

// Document Status
export const DOCUMENT_STATUS = {
  UPLOADED: 'uploaded',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
} as const;

// Check Status
export const CHECK_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

// Vendor Status
export const VENDOR_STATUS = {
  ACTIVE: 'active',
  PENDING: 'pending',
  SUSPENDED: 'suspended',
} as const;

// File Types
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// Default Compliance Checklist
export const DEFAULT_CHECKLIST = [
  'Tax Certificate',
  'Business License',
  'Insurance Certificate',
  'ISO Certification',
  'Data Privacy Policy',
  'Security Compliance',
  'Financial Statements',
  'References',
];

// Navigation Items
export const NAVIGATION_ITEMS = {
  VENDOR: [
    { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { name: 'Documents', href: '/documents', icon: 'FileText' },
    { name: 'Checklist', href: '/checklist', icon: 'CheckSquare' },
    { name: 'AI Assistant', href: '/ai-assistant', icon: 'Bot' },
    { name: 'Settings', href: '/settings', icon: 'Settings' },
  ],
  ADMIN: [
    { name: 'Dashboard', href: '/dashboard', icon: 'Home' },
    { name: 'Vendors', href: '/vendors', icon: 'Building2' },
    { name: 'Documents', href: '/documents', icon: 'FileText' },
    { name: 'AI Assistant', href: '/ai-assistant', icon: 'Bot' },
    { name: 'Admin', href: '/admin', icon: 'Shield' },
    { name: 'Settings', href: '/settings', icon: 'Settings' },
  ],
};