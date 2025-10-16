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

const checklistCategories = [
  {
    name: 'Legal & Compliance',
    items: ['Business License', 'Data Privacy Policy', 'Terms of Service'],
  },
  {
    name: 'Security & Certifications',
    items: ['ISO 27001 Certification', 'Security Compliance Audit', 'Penetration Test Report'],
  },
  {
    name: 'Financial & Insurance',
    items: ['Insurance Certificate', 'Financial Statements', 'Tax Certificate'],
  },
  {
    name: 'Operational',
    items: ['Service Level Agreement', 'Business Continuity Plan', 'Disaster Recovery Plan'],
  },
];
export default function ChecklistPage() {
  const [checks, setChecks] = useState<Check[]>([]);
  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChecks();
  }, []);

  const fetchChecks = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/checks');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setChecks(data || []);
    } catch (error) {
      console.error('Error fetching checks:', error);
      // Set some sample data for demo purposes if API fails
      setChecks([
        {
          id: '1',
          vendor_id: '1',
          check_name: 'Business License',
          status: 'approved',
          comments: 'Valid until 2025',
          due_date: '2025-12-31',
          created_at: new Date().toISOString(),
          vendor: { name: 'TechCorp Solutions' }
        },
        {
          id: '2',
          vendor_id: '2',
          check_name: 'ISO 27001 Certification',
          status: 'pending',
          comments: 'Awaiting renewal documentation',
          due_date: '2024-03-15',
          created_at: new Date().toISOString(),
          vendor: { name: 'DataFlow Systems' }
        },
        {
          id: '3',
          vendor_id: '1',
          check_name: 'Insurance Certificate',
          status: 'rejected',
          comments: 'Coverage amount insufficient',
          due_date: '2024-02-28',
          created_at: new Date().toISOString(),
          vendor: { name: 'TechCorp Solutions' }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
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

  const handleStatusUpdate = async (checkId: string, newStatus: 'approved' | 'rejected') => {
    try {
      const response = await fetch(`/api/checks/${checkId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          comments: comment || selectedCheck?.comments,
        }),
      });

      if (response.ok) {
        const updatedCheck = await response.json();
        setChecks(prev => prev.map(check => 
          check.id === checkId ? updatedCheck : check
        ));
      } else {
        // Fallback to local update if API fails
        setChecks(prev => prev.map(check => 
          check.id === checkId 
            ? { 
                ...check, 
                status: newStatus,
                comments: comment || check.comments,
                checked_by: '1' // Current user
              }
            : check
        ));
      }
    } catch (error) {
      console.error('Error updating check:', error);
      // Fallback to local update
      setChecks(prev => prev.map(check => 
        check.id === checkId 
          ? { 
              ...check, 
              status: newStatus,
              comments: comment || check.comments,
              checked_by: '1' // Current user
            }
          : check
      ));
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

  const progress = calculateProgress();
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
            Track your compliance requirements and document status
          </p>
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

      {/* Checklist by Categories */}
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
                        const hasCheck = !!check;
                        
                        return (
                          <div
                            key={itemName}
                            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {hasCheck ? getStatusIcon(check.status) : <Clock className="h-5 w-5 text-gray-400" />}
                              <div>
                                <p className="font-medium text-gray-900">{itemName}</p>
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
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              {hasCheck && getStatusBadge(check.status)}
                              
                              <div className="flex space-x-2">
                                {check?.evidence_url && (
                                  <Button variant="ghost" size="sm">
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                )}
                                
                                <Button variant="ghost" size="sm">
                                  <Upload className="h-4 w-4" />
                                </Button>
                                
                                {hasCheck && (
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => setSelectedCheck(check)}
                                      >
                                        <MessageSquare className="h-4 w-4" />
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Review: {check.check_name}</DialogTitle>
                                      </DialogHeader>
                                      <div className="space-y-4">
                                        <div>
                                          <p className="text-sm text-gray-600 mb-2">Current Status:</p>
                                          {getStatusBadge(check.status)}
                                        </div>
                                        
                                        {check.comments && (
                                          <div>
                                            <p className="text-sm text-gray-600 mb-2">Previous Comments:</p>
                                            <p className="text-sm bg-gray-50 p-3 rounded">{check.comments}</p>
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
                                            onClick={() => handleStatusUpdate(check.id, 'approved')}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            Approve
                                          </Button>
                                          <Button
                                            onClick={() => handleStatusUpdate(check.id, 'rejected')}
                                            variant="destructive"
                                          >
                                            <XCircle className="mr-2 h-4 w-4" />
                                            Reject
                                          </Button>
                                        </div>
                                      </div>
                                    </DialogContent>
                                  </Dialog>
                                )}
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
    </div>
  );
}