'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Search,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react';
import { Document } from '@/types';

export default function ReviewPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('uploaded'); // Show only pending documents by default
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewComments, setReviewComments] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/documents', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        // Handle both old format (array) and new format (object with documents property)
        const documents = Array.isArray(data) ? data : (data.documents || []);
        setDocuments(documents);
      } else {
        console.error('Failed to fetch documents:', response.statusText);
        setDocuments([]);
      }
      
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocuments = (Array.isArray(documents) ? documents : []).filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = (Array.isArray(documents) ? documents : []).filter(doc => doc.status === 'uploaded').length;
  const approvedCount = (Array.isArray(documents) ? documents : []).filter(doc => doc.status === 'verified').length;
  const rejectedCount = (Array.isArray(documents) ? documents : []).filter(doc => doc.status === 'rejected').length;

  const getStatusBadge = (status: string) => {
    const config = {
      uploaded: { 
        icon: Clock, 
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pending Review'
      },
      verified: { 
        icon: CheckCircle, 
        className: 'bg-green-100 text-green-800 border-green-200',
        text: 'Approved'
      },
      rejected: { 
        icon: XCircle, 
        className: 'bg-red-100 text-red-800 border-red-200',
        text: 'Rejected'
      },
    };
    
    const { icon: Icon, className, text } = config[status as keyof typeof config] || config.uploaded;
    
    return (
      <Badge className={className}>
        <Icon className="w-3 h-3 mr-1" />
        {text}
      </Badge>
    );
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('word')) return '📝';
    return '📁';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setShowReviewModal(true);
    setReviewAction(null);
    setReviewComments('');
  };

  const handleDownloadDocument = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`);
      
      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.name;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      console.log('📥 Download completed for:', doc.name);
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Failed to download document: ${error.message}`);
    }
  };

  const handleReviewSubmit = async () => {
    if (!selectedDocument || !reviewAction) return;

    setIsSubmittingReview(true);
    
    try {
      const newStatus = reviewAction === 'approve' ? 'verified' : 'rejected';
      
      const response = await fetch(`/api/documents/${selectedDocument.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: reviewComments || undefined,
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'current-reviewer', // In production, get from auth
        }),
      });

      if (response.ok) {
        const updatedDocument = await response.json();
        
        // Update the document in the list
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === selectedDocument.id 
              ? { ...doc, status: newStatus, remarks: reviewComments }
              : doc
          )
        );
        
        setShowReviewModal(false);
        setSelectedDocument(null);
        setReviewAction(null);
        setReviewComments('');
        
        console.log(`✅ Document ${reviewAction}d:`, selectedDocument.name);
      } else {
        throw new Error(`Review failed: ${response.statusText}`);
      }
      
    } catch (error) {
      console.error('Review submission failed:', error);
      alert(`Failed to submit review: ${error.message}`);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Document Review</h1>
          <p className="text-gray-600 mt-1">
            Review and approve vendor compliance documents
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <XCircle className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="uploaded">Pending Review</SelectItem>
                <SelectItem value="verified">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Documents for Review ({filteredDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Uploaded</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocuments.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <p className="text-sm text-gray-500">{doc.file_type}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(doc.status)}
                      {doc.remarks && (
                        <p className="text-xs text-gray-500">{doc.remarks}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm text-gray-600">{formatDate(doc.created_at)}</p>
                  </TableCell>
                  <TableCell>
                    {doc.expires_on ? (
                      <div className="flex items-center space-x-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm text-gray-600">
                          {new Date(doc.expires_on).toLocaleDateString()}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No expiry</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewDocument(doc)}
                        title="Review document"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDownloadDocument(doc)}
                        title="Download document"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading documents...</h3>
              <p className="text-gray-500">Please wait while we fetch documents for review</p>
            </div>
          )}

          {!isLoading && filteredDocuments.length === 0 && (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filters'
                  : 'No documents available for review'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Document</DialogTitle>
            <DialogDescription>
              Review and approve or reject this document
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <span className="text-3xl">{getFileIcon(selectedDocument.file_type)}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{selectedDocument.name}</h3>
                  <p className="text-sm text-gray-500">{selectedDocument.file_type}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div>{getStatusBadge(selectedDocument.status)}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Uploaded</label>
                  <p className="text-sm text-gray-900">{formatDate(selectedDocument.created_at)}</p>
                </div>
              </div>

              {selectedDocument.expires_on && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expires</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedDocument.expires_on).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Review Decision</label>
                <div className="flex space-x-3">
                  <Button
                    variant={reviewAction === 'approve' ? 'default' : 'outline'}
                    onClick={() => setReviewAction('approve')}
                    className="flex-1"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  <Button
                    variant={reviewAction === 'reject' ? 'destructive' : 'outline'}
                    onClick={() => setReviewAction('reject')}
                    className="flex-1"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comments {reviewAction === 'reject' && <span className="text-red-500">*</span>}
                </label>
                <Textarea
                  placeholder={
                    reviewAction === 'approve' 
                      ? 'Optional: Add approval comments...'
                      : reviewAction === 'reject'
                      ? 'Required: Explain why this document is being rejected...'
                      : 'Add your review comments...'
                  }
                  value={reviewComments}
                  onChange={(e) => setReviewComments(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowReviewModal(false)}
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleDownloadDocument(selectedDocument!)}
              variant="outline"
              disabled={isSubmittingReview}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button
              onClick={handleReviewSubmit}
              disabled={!reviewAction || (reviewAction === 'reject' && !reviewComments.trim()) || isSubmittingReview}
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}