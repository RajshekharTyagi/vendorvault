import { NextRequest, NextResponse } from 'next/server';
import { vendorVaultRAG } from '@/lib/ai-rag-engine';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client for API routes
function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseServiceKey);
}

// Function to fetch and analyze uploaded documents
async function getUploadedDocuments() {
  try {
    const supabase = createSupabaseClient();
    
    console.log('🔍 Fetching documents from database...');
    
    // First, try to fetch documents with vendor join
    let { data: documents, error } = await supabase
      .from('documents')
      .select(`
        id,
        name,
        file_type,
        file_content,
        status,
        vendor_id,
        created_at,
        vendors!inner(name)
      `)
      .order('created_at', { ascending: false });
    
    // If join fails, fetch documents without vendor info
    if (error) {
      console.log('⚠️ Vendor join failed, fetching documents without vendor info:', error.message);
      
      const { data: docsOnly, error: docsError } = await supabase
        .from('documents')
        .select(`
          id,
          name,
          file_type,
          file_content,
          status,
          vendor_id,
          created_at
        `)
        .order('created_at', { ascending: false });
      
      if (docsError) {
        console.error('❌ Error fetching documents:', docsError);
        return [];
      }
      
      // Manually fetch vendor names
      documents = docsOnly || [];
      if (documents && documents.length > 0) {
        const vendorIds = [...new Set(documents.map(d => d.vendor_id).filter(Boolean))];
        
        if (vendorIds.length > 0) {
          const { data: vendors } = await supabase
            .from('vendors')
            .select('id, name')
            .in('id', vendorIds);
          
          // Add vendor info to documents
          documents = documents.map(doc => ({
            ...doc,
            vendor: vendors?.find(v => v.id === doc.vendor_id) || null
          }));
        }
      }
    } else {
      // Restructure the joined data
      documents = documents?.map(doc => ({
        ...doc,
        vendor: doc.vendors || null
      })) || [];
    }
    
    console.log(`✅ Successfully fetched ${documents?.length || 0} documents`);
    return documents || [];
  } catch (error) {
    console.error('❌ Error in getUploadedDocuments:', error);
    return [];
  }
}

// Function to extract text content from base64 files
function extractTextFromDocument(document: any): string {
  try {
    if (!document.file_content) {
      return `Document: ${document.name} (${document.file_type}) - Status: ${document.status} - No content available`;
    }
    
    // For text files, decode base64 directly
    if (document.file_type?.includes('text') || document.name?.endsWith('.txt')) {
      return Buffer.from(document.file_content, 'base64').toString('utf-8');
    }
    
    // For PDFs and other files, provide metadata and attempt basic extraction
    let content = `Document: ${document.name}\n`;
    content += `Type: ${document.file_type}\n`;
    content += `Status: ${document.status}\n`;
    content += `Uploaded: ${new Date(document.created_at).toLocaleDateString()}\n`;
    
    if (document.vendor?.name) {
      content += `Vendor: ${document.vendor.name}\n`;
    }
    
    // Try to extract some text from base64 (this is basic and won't work perfectly for PDFs)
    try {
      const decoded = Buffer.from(document.file_content, 'base64').toString('utf-8');
      // Look for readable text patterns
      const textMatches = decoded.match(/[a-zA-Z\s]{10,}/g);
      if (textMatches && textMatches.length > 0) {
        content += `\nExtracted text preview: ${textMatches.slice(0, 3).join(' ').substring(0, 200)}...`;
      }
    } catch (extractError) {
      // Ignore extraction errors for binary files
    }
    
    return content;
  } catch (error) {
    console.error('Error extracting text from document:', error);
    return `Document: ${document.name} - Unable to extract content`;
  }
}

// Function to search documents for relevant content
function searchDocumentsForQuery(documents: any[], query: string): any[] {
  const queryLower = query.toLowerCase();
  const relevantDocs = [];
  
  console.log(`🔍 Searching ${documents.length} documents for query: "${query}"`);
  
  for (const doc of documents) {
    const textContent = extractTextFromDocument(doc);
    const docName = doc.name?.toLowerCase() || '';
    const vendorName = doc.vendor?.name?.toLowerCase() || '';
    
    let isRelevant = false;
    
    // Check for specific file name mentions
    const fileNameParts = query.toLowerCase().match(/["']([^"']+)["']|(\S+\.\w+)/g);
    if (fileNameParts) {
      for (const part of fileNameParts) {
        const cleanPart = part.replace(/["']/g, '');
        if (docName.includes(cleanPart) || cleanPart.includes(docName.replace(/\.\w+$/, ''))) {
          isRelevant = true;
          break;
        }
      }
    }
    
    // Check for general document queries
    if (!isRelevant) {
      const documentKeywords = ['overview', 'file', 'document', 'upload', 'pdf', 'resume', 'syllabus'];
      const hasDocumentKeyword = documentKeywords.some(keyword => queryLower.includes(keyword));
      
      if (hasDocumentKeyword) {
        isRelevant = true;
      }
    }
    
    // Check if query matches document name, vendor, or content
    if (isRelevant || 
        docName.includes(queryLower) || 
        vendorName.includes(queryLower) || 
        textContent.toLowerCase().includes(queryLower)) {
      relevantDocs.push({
        ...doc,
        textContent,
        relevanceScore: calculateRelevanceScore(query, doc, textContent)
      });
    }
  }
  
  console.log(`📄 Found ${relevantDocs.length} relevant documents`);
  
  // Sort by relevance score
  return relevantDocs.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// Calculate relevance score for document matching
function calculateRelevanceScore(query: string, document: any, textContent: string): number {
  const queryLower = query.toLowerCase();
  const docName = document.name?.toLowerCase() || '';
  let score = 0;
  
  // Exact file name match (highest priority)
  const fileNameParts = query.toLowerCase().match(/["']([^"']+)["']|(\S+\.\w+)/g);
  if (fileNameParts) {
    for (const part of fileNameParts) {
      const cleanPart = part.replace(/["']/g, '');
      if (docName === cleanPart) score += 20; // Exact match
      else if (docName.includes(cleanPart)) score += 15; // Partial match
      else if (cleanPart.includes(docName.replace(/\.\w+$/, ''))) score += 12; // Name without extension
    }
  }
  
  // General name match
  if (docName.includes(queryLower)) score += 10;
  
  // Vendor name match
  if (document.vendor?.name?.toLowerCase().includes(queryLower)) score += 8;
  
  // Content match
  const contentMatches = (textContent.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length;
  score += contentMatches * 2;
  
  // Recent documents get slight boost
  const daysSinceUpload = (Date.now() - new Date(document.created_at).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSinceUpload < 7) score += 1;
  
  return score;
}

export async function POST(request: NextRequest) {
  try {
    const { message, context, userRole } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }
    
    console.log('🤖 AI Assistant processing query:', message);
    
    // Fetch uploaded documents
    const uploadedDocuments = await getUploadedDocuments();
    console.log(`📄 Found ${uploadedDocuments.length} uploaded documents`);
    
    // Search for relevant documents
    const relevantDocs = searchDocumentsForQuery(uploadedDocuments, message);
    console.log(`🔍 Found ${relevantDocs.length} relevant documents`);
    
    // Process the query through our RAG engine with document context
    const ragResponse = await vendorVaultRAG.processQuery(message, {
      previousQuestions: [],
      currentTopic: context || 'general',
      userRole: userRole,
      uploadedDocuments: relevantDocs
    });
    
    // If we found relevant documents, enhance the response
    let enhancedResponse = ragResponse.answer;
    let sources = ragResponse.sources;
    
    if (relevantDocs.length > 0) {
      // Check if user is asking about a specific file
      const fileNameParts = message.toLowerCase().match(/["']([^"']+)["']|(\S+\.\w+)/g);
      const isSpecificFileQuery = fileNameParts && fileNameParts.length > 0;
      
      if (isSpecificFileQuery && relevantDocs.length === 1) {
        // Specific file query - focus on that file
        const doc = relevantDocs[0];
        enhancedResponse = `📄 **File Overview: ${doc.name}**\n\n`;
        enhancedResponse += `**📋 Document Details:**\n`;
        enhancedResponse += `• **File Name:** ${doc.name}\n`;
        enhancedResponse += `• **File Type:** ${doc.file_type}\n`;
        enhancedResponse += `• **Status:** ${doc.status}\n`;
        enhancedResponse += `• **Uploaded:** ${new Date(doc.created_at).toLocaleDateString()}\n`;
        enhancedResponse += `• **Vendor:** ${doc.vendor?.name || 'Not specified'}\n\n`;
        
        if (doc.textContent && doc.textContent.length > 100) {
          enhancedResponse += `**📄 Content Preview:**\n${doc.textContent.substring(0, 500)}${doc.textContent.length > 500 ? '...' : ''}\n\n`;
        }
        
        enhancedResponse += `**✅ Analysis:**\nThis document has been successfully uploaded and verified in your VendorVault system. `;
        
        if (doc.name.toLowerCase().includes('resume')) {
          enhancedResponse += `This appears to be a resume document, which is commonly used for vendor personnel verification and compliance purposes.`;
        } else if (doc.name.toLowerCase().includes('syllabus')) {
          enhancedResponse += `This appears to be an educational syllabus document, which may be used for training or certification compliance.`;
        } else {
          enhancedResponse += `You can review, download, or manage this document through the VendorVault dashboard.`;
        }
      } else if (isSpecificFileQuery && relevantDocs.length > 1) {
        // Multiple matches for specific file query
        const exactMatch = relevantDocs.find(doc => 
          fileNameParts.some(part => {
            const cleanPart = part.replace(/["']/g, '');
            return doc.name.toLowerCase().includes(cleanPart.toLowerCase());
          })
        );
        
        if (exactMatch) {
          enhancedResponse = `📄 **File Overview: ${exactMatch.name}**\n\n`;
          enhancedResponse += `I found a document that matches your query. Here are the details:\n\n`;
          enhancedResponse += `**📋 Document Details:**\n`;
          enhancedResponse += `• **File Name:** ${exactMatch.name}\n`;
          enhancedResponse += `• **File Type:** ${exactMatch.file_type}\n`;
          enhancedResponse += `• **Status:** ${exactMatch.status}\n`;
          enhancedResponse += `• **Uploaded:** ${new Date(exactMatch.created_at).toLocaleDateString()}\n`;
          enhancedResponse += `• **Vendor:** ${exactMatch.vendor?.name || 'Not specified'}\n\n`;
          
          if (exactMatch.textContent && exactMatch.textContent.length > 100) {
            enhancedResponse += `**📄 Content Preview:**\n${exactMatch.textContent.substring(0, 500)}${exactMatch.textContent.length > 500 ? '...' : ''}\n\n`;
          }
        } else {
          enhancedResponse = `I found ${relevantDocs.length} documents that might match your query:\n\n`;
          relevantDocs.slice(0, 3).forEach((doc, index) => {
            enhancedResponse += `${index + 1}. **${doc.name}** - ${doc.status}\n`;
          });
        }
      } else {
        // General document query
        const documentSummary = relevantDocs.slice(0, 3).map(doc => {
          const preview = doc.textContent.substring(0, 200);
          return `📄 **${doc.name}** (${doc.vendor?.name || 'Unknown Vendor'})\n${preview}${doc.textContent.length > 200 ? '...' : ''}`;
        }).join('\n\n');
        
        enhancedResponse = `Based on your uploaded documents, here's what I found:\n\n${documentSummary}\n\n---\n\n${ragResponse.answer}`;
      }
      
      sources = [...sources, ...relevantDocs.map(doc => `Document: ${doc.name}`)];
    }
    
    return NextResponse.json({
      response: enhancedResponse,
      sources: sources,
      confidence: relevantDocs.length > 0 ? Math.min(ragResponse.confidence + 0.2, 1.0) : ragResponse.confidence,
      suggestions: ragResponse.suggestions,
      thinking: ragResponse.thinking,
      documentsFound: relevantDocs.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI Chat API Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process AI request',
        response: 'I apologize, but I encountered an issue processing your request. Please try again.',
        sources: ['Error Handler'],
        confidence: 0.1
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'VendorVault AI Chat API is running',
    version: '1.0.0',
    capabilities: [
      'Project information and overview',
      'User roles and permissions',
      'Technical architecture details',
      'Feature explanations',
      'Compliance management guidance',
      'AI capabilities overview'
    ]
  });
}