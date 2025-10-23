# Document Review System

## Overview
I've created a comprehensive document review system that allows reviewers to approve or reject uploaded documents with comments.

## 🎯 **Where to Access Reviews**

### For Admin/Auditor Users:
1. **Navigate to "Review" in the sidebar** (new menu item added)
2. **Or go directly to**: `/review`

### For All Users:
- The **Documents page** shows document statuses
- **Pending Review** = Yellow badge (needs review)
- **Approved** = Green badge (reviewed and approved)
- **Rejected** = Red badge (reviewed and rejected)

## 📋 **Review Process**

### Step 1: Access Review Dashboard
- Go to `/review` page
- See overview stats: Pending, Approved, Rejected counts
- Filter documents by status (default shows "Pending Review")

### Step 2: Review a Document
1. **Click the review icon** (💬) next to any document
2. **Review modal opens** showing:
   - Document details (name, type, upload date, expiry)
   - Current status
   - Download button to view the actual file

### Step 3: Make Decision
1. **Choose action**: 
   - **Approve** (green button with ✓)
   - **Reject** (red button with ✗)

2. **Add comments**:
   - **Optional for approval**: "Document meets all requirements"
   - **Required for rejection**: Must explain why it's rejected

### Step 4: Submit Review
- Click **"Submit Review"**
- Document status updates immediately
- Comments are saved and visible to all users

## 🔧 **Database Setup Required**

Run this SQL in your Supabase SQL Editor:

```sql
-- Add review columns to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS reviewed_by TEXT;
```

## 📊 **Features Included**

### Review Dashboard (`/review`)
- ✅ **Stats Overview**: Pending, Approved, Rejected counts
- ✅ **Document List**: All documents with review status
- ✅ **Search & Filter**: Find specific documents
- ✅ **Quick Actions**: Review and download buttons

### Review Modal
- ✅ **Document Preview**: Name, type, upload date, expiry
- ✅ **Download Integration**: View actual file content
- ✅ **Approve/Reject Buttons**: Clear action choices
- ✅ **Comments System**: Required for rejections, optional for approvals
- ✅ **Real-time Updates**: Status changes immediately

### API Endpoints
- ✅ **PATCH /api/documents/[id]**: Update document status and comments
- ✅ **GET /api/documents**: Fetch all documents with review status
- ✅ **GET /api/documents/[id]/download**: Download actual files

### Navigation
- ✅ **Added "Review" menu**: Available for admin and auditor roles
- ✅ **Role-based Access**: Only admin/auditor see review menu
- ✅ **Active State**: Highlights current page

## 🎯 **User Experience**

### For Reviewers (Admin/Auditor):
1. **Dashboard Overview**: See how many documents need review
2. **Efficient Workflow**: Review, download, approve/reject in one place
3. **Comment System**: Add feedback for vendors
4. **Status Tracking**: See review history and decisions

### For Vendors:
1. **Status Visibility**: See if documents are pending, approved, or rejected
2. **Feedback Access**: Read reviewer comments on rejected documents
3. **Clear Actions**: Know exactly what needs to be fixed

## 🧪 **Testing the System**

1. **Upload a document** (as vendor)
2. **Switch to admin/auditor role** (or navigate to `/review`)
3. **Review the document**:
   - Click review icon
   - Download and check the file
   - Approve or reject with comments
4. **Verify status update** on documents page

## 📈 **Review Workflow**

```
Document Upload → Pending Review → Reviewer Action → Approved/Rejected
     ↓                ↓                 ↓              ↓
  (Yellow)         (Review Page)    (Comments)    (Green/Red)
```

## 🎉 **Result**

You now have a complete document review system where:
- ✅ **Reviewers can efficiently process documents**
- ✅ **Status tracking is clear and visible**
- ✅ **Comments provide feedback to vendors**
- ✅ **The workflow is streamlined and professional**

The review system is fully integrated with your existing document management!