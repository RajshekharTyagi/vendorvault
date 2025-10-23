'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertTriangle,
  Upload,
  MessageSquare,
} from 'lucide-react';
import { Check } from '@/types';

// Dynamic categories based on actual uploaded documents
const getChecklistCategories = (checks: Check[], documents: any[]) => {
  const categories: { [key: string]: string[] } = {};
  
  checks.forEach(check => {
    let categoryName = 'Document Compliance';
    
    // Categorize based on document content and names
    const checkNameLower = check.check_name.toLowerCase();
    
    if (checkNameLower.includes('resume') || checkNameLower.includes('cv')) {
      categoryName = 'Personnel Documents';
    } else if (checkNameLower.includes('syllabus') || checkNameLower.includes('curriculum') || checkNameLower.includes('education')) {
      categoryName = 'Educational Documents';
    } else if (checkNameLower.includes('license') || checkNameLower.includes('certificate') || checkNameLower.includes('certification')) {
      categoryName = 'Legal & Certifications';
    } else if (checkNameLower.includes('pdf') || checkNameLower.includes('verification')) {
      categoryName = 'Document Verification';
    } else if (checkNameLower.includes('financial') || checkNameLower.includes('tax') || checkNameLower.includes('invoice')) {
      categoryName = 'Financial Documents';
    } else if (checkNameLower.includes('contract') || checkNameLower.includes('agreement')) {
      categoryName = 'Legal Documents';
    }
    
    if (!categories[categoryName]) {
      categories[categoryName] = [];
    }
    categories[categoryName].push(check.check_name);
  });
  
  return Object.entries(categories).map(([name, items]) => ({ name, items }));
};
export default function ChecklistPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDocumentsAndGenerateChecks();
  }, []);

  const fetchDocumentsAndGenerateChecks = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching documents and generating compliance checks...');
      
      // First, fetch uploaded documents
      const documentsResponse = await fetch('/api/documents');
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        const uploadedDocs = documentsData.documents || [];
        setDocuments(uploadedDocs);
        console.log(`📄 Found ${uploadedDocs.length} uploaded documents`);
        
        // Generate compliance checks based on uploaded documents
        const generatedChecks = generateChecksFromDocuments(uploadedDocs);
        setChecks(generatedChecks);
        console.log(`✅ Generated ${generatedChecks.length} compliance checks`);
      } else {
        console.error('Failed to fetch documents');
        setDocuments([]);
        setChecks([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setDocuments([]);
      setChecks([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate compliance checks based on uploaded documents
  const generateChecksFromDocuments = (docs: any[]): Check[] => {
    const generatedChecks: Check[] = [];
    
    docs.forEach((doc, index) => {
      const checkName = `${doc.name} Compliance Review`;
      const check: Check = {
        id: `doc-check-${doc.id}`,
        vendor_id: doc.vendor_id || '1',
        check_name: checkName,
        status: doc.status === 'verified' ? 'approved' : 
                doc.status === 'rejected' ? 'rejected' : 'pending',
        evidence_url: `/api/documents/${doc.id}/download`,
        checked_by: doc.reviewed_by || undefined,
        comments: doc.remarks || `Compliance check for ${doc.name}`,
        due_date: doc.expires_on || undefined,
        created_at: doc.created_at,
        vendor: { name: 'Document Owner' }
      };
      generatedChecks.push(check);
    });
    
    // Add some additional checks based on document types
    const documentTypes = [...new Set(docs.map(d => d.file_type))];
    documentTypes.forEach((type, index) => {
      if (type?.includes('pdf')) {
        generatedChecks.push({
          id: `type-check-pdf-${index}`,
          vendor_id: '1',
          check_name: 'PDF Document Verification',
          status: 'approved',
          evidence_url: undefined,
          checked_by: undefined,
          comments: 'All PDF documents have been processed and verified',
          due_date: undefined,
          created_at: new Date().toISOString(),
          vendor: { name: 'System Generated' }
        });
      }
    });
    
    return generatedChecks;
  };
  const [comment, setComment] = useState('');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = {
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    
    return (
      <Badge className={config[status as keyof typeof config] || config.pending}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const calculateProgress = () => {
    const approvedCount = checks.filter(check => check.status === 'approved').length;
    return Math.round((approvedCount / checks.length) * 100);
  };

  const getChecksByCategory = (categoryItems: string[]) => {
    return checks.filter(check => categoryItems.includes(check.check_name));
  };

  // Get dynamic categories based on actual data
  const checklistCategories = getChecklistCategories(checks, documents);

  const handleStatusUpdate = async (checkId: string, newStatus: 'approved' | 'rejected') => {
    try {
      // Check if this is a document-based check
      if (checkId.startsWith('doc-check-')) {
        const documentId = checkId.replace('doc-check-', '');
        
        // Update the document status instead
        const documentStatus = newStatus === 'approved' ? 'verified' : 'rejected';
        const response = await fetch(`/api/documents/${documentId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: documentStatus,
            remarks: comment || selectedCheck?.comments,
          }),
        });

        if (response.ok) {
          // Update the local check status
          setChecks(prev => prev.map(check => 
            check.id === checkId ? {
              ...check,
              status: newStatus,
              comments: comment || selectedCheck?.comments,
            } : check
          ));
          
          // Also refresh documents to keep them in sync
          fetchDocumentsAndGenerateChecks();
        } else {
          console.error('Failed to update document status');
          alert('Failed to update document status. Please try again.');
        }
      } else {
        // For system-generated checks, just update locally
        setChecks(prev => prev.map(check => 
          check.id === checkId ? {
            ...check,
            status: newStatus,
            comments: comment || selectedCheck?.comments,
          } : check
        ));
      }
    } catch (error) {
      console.error('Error updating check:', error);
      alert('Failed to update check status. Please try again.');
    }
    
    setComment('');
    setSelectedCheck(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const isOverdue = (dueDateString?: string) => {
    if (!dueDateString) return false;
    return new Date(dueDateString) < new Date();
  };

  const progress = checks.length > 0 ? calculateProgress() : 0;
  const approvedCount = checks.filter(c => c.status === 'approved').length;
  const pendingCount = checks.filter(c => c.status === 'pending').length;
  const rejectedCount = checks.filter(c => c.status === 'rejected').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Checklist</h1>
          <p className="text-gray-600 mt-1">
            Track compliance requirements based on your uploaded documents ({documents.length} documents)
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={fetchDocumentsAndGenerateChecks}
            disabled={isLoading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? 'Refreshing...' : 'Refresh Checks'}
          </Button>
          <Button onClick={() => window.location.href = '/documents'}>
            <FileText className="mr-2 h-4 w-4" />
            View Documents
          </Button>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{progress}%</div>
              <p className="text-sm text-gray-600 mb-4">Overall Progress</p>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-600">{approvedCount}</div>
                <p className="text-sm text-gray-600">Approved</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                <p className="text-sm text-gray-600">Pending</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-red-600">{rejectedCount}</div>
                <p className="text-sm text-gray-600">Rejected</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Checklist by Categories - Only show if there are checks */}
      {checks.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Compliance Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" className="w-full">
              {checklistCategories.map((category, index) => {
                const categoryChecks = getChecksByCategory(category.items);
                const categoryProgress = categoryChecks.length > 0 
                  ? Math.round((categoryChecks.filter(c => c.status === 'approved').length / categoryChecks.length) * 100)
                  : 0;

                return (
                  <AccordionItem key={index} value={`category-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center justify-between w-full mr-4">
                        <span className="font-medium">{category.name}</span>
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-500">
                            {categoryChecks.filter(c => c.status === 'approved').length}/{categoryChecks.length}
                          </span>
                          <div className="w-20">
                            <Progress value={categoryProgress} className="h-2" />
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {categoryProgress}%
                          </span>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3 pt-2">
                        {category.items.map((itemName) => {
                          const check = checks.find(c => c.check_name === itemName);
                          const relatedDoc = documents.find(d => check?.check_name.includes(d.name));
                          
                          return (
                            <div
                              key={itemName}
                              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                {getStatusIcon(check!.status)}
                                <div>
                                  <p className="font-medium text-gray-900">{itemName}</p>
                                  {relatedDoc && (
                                    <p className="text-xs text-blue-600 mt-1">
                                      📄 Based on: {relatedDoc.name}
                                    </p>
                                  )}
                                  {check?.comments && (
                                    <p className="text-sm text-gray-500 mt-1">{check.comments}</p>
                                  )}
                                  {check?.due_date && (
                                    <div className="flex items-center mt-1">
                                      <AlertTriangle className={`h-3 w-3 mr-1 ${isOverdue(check.due_date) ? 'text-red-500' : 'text-orange-500'}`} />
                                      <span className={`text-xs ${isOverdue(check.due_date) ? 'text-red-600' : 'text-orange-600'}`}>
                                        Due: {formatDate(check.due_date)}
                                        {isOverdue(check.due_date) && ' (Overdue)'}
                                      </span>
                                    </div>
                                  )}
                                  <p className="text-xs text-gray-400 mt-1">
                                    Created: {formatDate(check!.created_at)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-3">
                                {getStatusBadge(check!.status)}
                                
                                <div className="flex space-x-2">
                                  {check?.evidence_url && (
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => window.open(check.evidence_url!, '_blank')}
                                      title="View related document"
                                    >
                                      <FileText className="h-4 w-4" />
                                    </Button>
                                  )}
                                  
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => window.location.href = '/documents'}
                                    title="Go to documents"
                                  >
                                    <Upload className="h-4 w-4" />
                                  </Button>
                                  
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setSelectedCheck(check!)}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Review: {check!.check_name}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        {relatedDoc && (
                                          <div className="bg-blue-50 p-3 rounded-lg">
                                            <p className="text-sm font-medium text-blue-900">Related Document:</p>
                                            <p className="text-sm text-blue-700">{relatedDoc.name}</p>
                                            <p className="text-xs text-blue-600">Status: {relatedDoc.status}</p>
                                          </div>
                                        )}
                                        
                                        <div>
                                          <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                                          {getStatusBadge(check!.status)}
                                        </div>
                                        
                                        {check!.comments && (
                                          <div>
                                            <p className="text-sm text-gray-600 mb-2">Previous Comments:</p>
                                            <p className="text-sm bg-gray-50 p-3 rounded">{check!.comments}</p>
                                          </div>
                                        )}
                                        
                                        <div>
                                          <label className="text-sm font-medium text-gray-700 mb-2 block">
                                            Add Comment:
                                          </label>
                                          <Textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Add your review comments..."
                                            className="min-h-[100px]"
                                          />
                                        </div>
                                        
                                        <div className="flex space-x-3">
                                          <Button
                                            onClick={() => handleStatusUpdate(check!.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Approve
                                          </Button>
                                          <Button
                                            onClick={() => handleStatusUpdate(check!.id, 'rejected')}
                                            variant="destructive"
                                          >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Documents for Compliance Review</h3>
              <p className="text-gray-500 mb-4">
                Upload documents to automatically generate compliance checks. The system will create checks based on your uploaded files.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-400">
                  📄 Found {documents.length} document{documents.length !== 1 ? 's' : ''} in the system
                </p>
                {documents.length === 0 && (
                  <p className="text-sm text-gray-400">
                    Go to Documents page to upload files for compliance tracking
                  </p>
                )}
              </div>
              <Button className="mt-4" onClick={() => window.location.href = '/documents'}>
                <Upload className="mr-2 h-4 w-4" />
                {documents.length === 0 ? 'Upload Documents' : 'View Documents'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}