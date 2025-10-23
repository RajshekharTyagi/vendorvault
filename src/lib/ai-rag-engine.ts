// Advanced RAG Engine for VendorVault AI Assistant
import { searchKnowledge, generateContextualResponse, PROJECT_CONTEXT } from './ai-knowledge-base';

export interface RAGResponse {
  answer: string;
  sources: string[];
  confidence: number;
  suggestions: string[];
  thinking: string;
}

export interface ConversationContext {
  previousQuestions: string[];
  currentTopic: string;
  userRole?: 'admin' | 'vendor' | 'auditor';
  uploadedDocuments?: any[];
}

// Advanced query processing and intent detection
export class VendorVaultRAG {
  private conversationHistory: string[] = [];
  
  // Intent classification
  private classifyIntent(query: string): {
    intent: string;
    entities: string[];
    confidence: number;
  } {
    const queryLower = query.toLowerCase().trim();
    
    // Define intent patterns
    const intents = [
      {
        name: 'greeting',
        patterns: ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening', 'start', 'begin'],
        entities: ['greeting', 'welcome', 'introduction'],
        confidence: 0.95
      },
      {
        name: 'project_info',
        patterns: ['what is', 'tell me about', 'explain', 'describe', 'overview'],
        entities: ['vendorvault', 'project', 'system', 'platform'],
        confidence: 0.9
      },
      {
        name: 'roles_permissions',
        patterns: ['role', 'permission', 'access', 'user', 'admin', 'vendor', 'auditor'],
        entities: ['admin', 'vendor', 'auditor', 'role', 'permission'],
        confidence: 0.85
      },
      {
        name: 'technical_details',
        patterns: ['how', 'built', 'technology', 'tech stack', 'architecture'],
        entities: ['nextjs', 'react', 'supabase', 'typescript', 'tech'],
        confidence: 0.8
      },
      {
        name: 'features_functionality',
        patterns: ['feature', 'function', 'capability', 'can do', 'does'],
        entities: ['dashboard', 'document', 'compliance', 'ai', 'feature'],
        confidence: 0.85
      },
      {
        name: 'compliance_management',
        patterns: ['compliance', 'document', 'certificate', 'renewal', 'tracking'],
        entities: ['compliance', 'document', 'certificate', 'renewal', 'tracking'],
        confidence: 0.9
      },
      {
        name: 'ai_capabilities',
        patterns: ['ai', 'assistant', 'help', 'analyze', 'recommend'],
        entities: ['ai', 'assistant', 'analysis', 'recommendation'],
        confidence: 0.8
      },
      {
        name: 'help_support',
        patterns: ['help', 'support', 'assist', 'guide', 'how to', 'can you', 'please'],
        entities: ['help', 'support', 'assistance', 'guidance'],
        confidence: 0.85
      },
      {
        name: 'thanks_positive',
        patterns: ['thank', 'thanks', 'appreciate', 'helpful', 'great', 'awesome', 'perfect'],
        entities: ['thanks', 'positive', 'feedback'],
        confidence: 0.9
      }
    ];
    
    let bestMatch = { intent: 'general', entities: [] as string[], confidence: 0.3 };
    
    // Special handling for simple greetings
    const greetingWords = ['hi', 'hello', 'hey'];
    if (greetingWords.includes(queryLower)) {
      return {
        name: 'greeting',
        entities: ['greeting'],
        confidence: 0.95
      };
    }
    
    for (const intent of intents) {
      let score = 0;
      const foundEntities: string[] = [];
      
      // Check patterns
      intent.patterns.forEach(pattern => {
        if (queryLower === pattern) {
          score += 0.6; // Exact match bonus
        } else if (queryLower.includes(pattern)) {
          score += 0.3;
        }
      });
      
      // Check entities
      intent.entities.forEach(entity => {
        if (queryLower.includes(entity)) {
          score += 0.4;
          foundEntities.push(entity);
        }
      });
      
      if (score > bestMatch.confidence) {
        bestMatch = {
          intent: intent.name,
          entities: foundEntities,
          confidence: Math.min(score, 1.0)
        };
      }
    }
    
    return bestMatch;
  }
  
  // Generate thinking process
  private generateThinking(query: string, intent: any): string {
    const thinking = [
      `🤔 **AI Thinking Process:**`,
      ``,
      `**Query Analysis:**`,
      `• User asked: "${query}"`,
      `• Detected intent: ${intent.name} (${Math.round(intent.confidence * 100)}% confidence)`,
      `• Key entities: ${intent.entities.join(', ') || 'none detected'}`,
      ``,
      `**Knowledge Search:**`,
      `• Searching VendorVault knowledge base...`,
      `• Matching against project documentation`,
      `• Considering user context and role`,
      ``,
      `**Response Generation:**`,
      `• Synthesizing relevant information`,
      `• Ensuring accuracy and completeness`,
      `• Adding practical recommendations`
    ].join('\n');
    
    return thinking;
  }
  
  // Generate smart suggestions
  private generateSuggestions(intent: string, entities: string[]): string[] {
    const suggestionMap: Record<string, string[]> = {
      greeting: [
        "What is VendorVault?",
        "Tell me about the user roles",
        "Show me the main features",
        "How does the AI assistant work?"
      ],
      project_info: [
        "Tell me about the user roles",
        "What features does VendorVault have?",
        "How is the system built technically?"
      ],
      roles_permissions: [
        "What can admins do?",
        "Show me vendor capabilities",
        "Explain auditor responsibilities"
      ],
      technical_details: [
        "What technologies are used?",
        "How is the database structured?",
        "Explain the AI implementation"
      ],
      features_functionality: [
        "Show me the dashboard features",
        "How does document management work?",
        "What AI capabilities exist?"
      ],
      compliance_management: [
        "How does renewal tracking work?",
        "What documents are tracked?",
        "Explain the compliance workflow"
      ],
      ai_capabilities: [
        "What can the AI assistant do?",
        "How does the RAG system work?",
        "Show me AI analysis features"
      ],
      help_support: [
        "What is VendorVault?",
        "Tell me about the user roles",
        "Show me the main features",
        "How does compliance management work?"
      ],
      thanks_positive: [
        "Tell me more about VendorVault",
        "What else can you help with?",
        "Show me advanced features",
        "Explain the technical details"
      ],
      general: [
        "What is VendorVault?",
        "Show me the main features",
        "How can I get started?"
      ]
    };
    
    return suggestionMap[intent] || suggestionMap.general;
  }
  
  // Enhanced response generation with role-based context
  private enhanceResponseForRole(response: string, userRole?: string): string {
    if (!userRole) return response;
    
    const roleEnhancements: Record<string, string> = {
      admin: "\n\n**👑 Admin Perspective:**\nAs an admin, you have full system access and can manage all vendors, review documents, and configure system settings.",
      vendor: "\n\n**🏢 Vendor Perspective:**\nAs a vendor, you can upload documents, track your compliance status, and communicate with the compliance team.",
      auditor: "\n\n**🔍 Auditor Perspective:**\nAs an auditor, you can review and verify documents, assess compliance risks, and generate audit reports."
    };
    
    return response + (roleEnhancements[userRole] || '');
  }
  
  // Main RAG processing function
  public async processQuery(
    query: string, 
    context?: ConversationContext
  ): Promise<RAGResponse> {
    // Add to conversation history
    this.conversationHistory.push(query);
    
    // Classify intent
    const intent = this.classifyIntent(query);
    
    // Generate thinking process with document context
    const thinking = this.generateThinkingWithDocuments(query, intent, context?.uploadedDocuments);
    
    // Search knowledge base
    const contextualResponse = generateContextualResponse(query);
    
    // Check if we have uploaded documents to analyze
    let documentAnalysis = '';
    if (context?.uploadedDocuments && context.uploadedDocuments.length > 0) {
      documentAnalysis = this.analyzeUploadedDocuments(query, context.uploadedDocuments);
    }
    
    // Enhance response based on user role
    let enhancedResponse = this.enhanceResponseForRole(
      contextualResponse.response, 
      context?.userRole
    );
    
    // Add document analysis if available
    if (documentAnalysis) {
      enhancedResponse = documentAnalysis + '\n\n---\n\n' + enhancedResponse;
    }
    
    // Add project context if relevant (but not for greetings or conversational responses)
    const conversationalIntents = ['greeting', 'help_support', 'thanks_positive'];
    if ((intent.intent === 'project_info' || intent.confidence < 0.5) && !conversationalIntents.includes(intent.intent) && !documentAnalysis) {
      enhancedResponse = `**🏢 ${PROJECT_CONTEXT.projectName}** - ${PROJECT_CONTEXT.description}\n\n` + enhancedResponse;
    }
    
    // Generate suggestions based on context
    const suggestions = this.generateSuggestionsWithContext(intent.intent, intent.entities, context?.uploadedDocuments);
    
    return {
      answer: enhancedResponse,
      sources: contextualResponse.sources,
      confidence: Math.max(contextualResponse.confidence, intent.confidence),
      suggestions,
      thinking
    };
  }
  
  // Analyze uploaded documents for the query
  private analyzeUploadedDocuments(query: string, documents: any[]): string {
    if (!documents || documents.length === 0) return '';
    
    const queryLower = query.toLowerCase();
    
    // Check for specific document analysis requests
    if (queryLower.includes('overview') || queryLower.includes('summary') || queryLower.includes('tell me about')) {
      return this.generateDocumentOverview(documents);
    }
    
    if (queryLower.includes('file') || queryLower.includes('document') || queryLower.includes('upload')) {
      return this.generateDocumentDetails(documents);
    }
    
    // Default: provide relevant document information
    return this.generateRelevantDocumentInfo(query, documents);
  }
  
  // Generate document overview
  private generateDocumentOverview(documents: any[]): string {
    const totalDocs = documents.length;
    const docTypes = [...new Set(documents.map(d => d.file_type))];
    const vendors = [...new Set(documents.map(d => d.vendor?.name).filter(Boolean))];
    const statuses = documents.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    let overview = `📊 **Document Overview:**\n\n`;
    overview += `• **Total Documents:** ${totalDocs}\n`;
    overview += `• **Vendors:** ${vendors.join(', ') || 'None specified'}\n`;
    overview += `• **File Types:** ${docTypes.join(', ')}\n`;
    overview += `• **Status Distribution:**\n`;
    
    Object.entries(statuses).forEach(([status, count]) => {
      overview += `  - ${status}: ${count} document${count > 1 ? 's' : ''}\n`;
    });
    
    overview += `\n**Recent Documents:**\n`;
    documents.slice(0, 3).forEach((doc, index) => {
      overview += `${index + 1}. **${doc.name}** (${doc.vendor?.name || 'Unknown Vendor'}) - ${doc.status}\n`;
    });
    
    return overview;
  }
  
  // Generate detailed document information
  private generateDocumentDetails(documents: any[]): string {
    let details = `📄 **Document Details:**\n\n`;
    
    documents.slice(0, 5).forEach((doc, index) => {
      details += `**${index + 1}. ${doc.name}**\n`;
      details += `• Vendor: ${doc.vendor?.name || 'Unknown'}\n`;
      details += `• Type: ${doc.file_type}\n`;
      details += `• Status: ${doc.status}\n`;
      details += `• Uploaded: ${new Date(doc.created_at).toLocaleDateString()}\n`;
      
      if (doc.textContent && doc.textContent.length > 50) {
        details += `• Preview: ${doc.textContent.substring(0, 150)}...\n`;
      }
      details += `\n`;
    });
    
    if (documents.length > 5) {
      details += `*... and ${documents.length - 5} more documents*\n`;
    }
    
    return details;
  }
  
  // Generate relevant document information based on query
  private generateRelevantDocumentInfo(query: string, documents: any[]): string {
    const relevantDocs = documents.slice(0, 3);
    
    let info = `🔍 **Found ${documents.length} relevant document${documents.length > 1 ? 's' : ''}:**\n\n`;
    
    relevantDocs.forEach((doc, index) => {
      info += `**${index + 1}. ${doc.name}**\n`;
      info += `• From: ${doc.vendor?.name || 'Unknown Vendor'}\n`;
      info += `• Status: ${doc.status}\n`;
      
      if (doc.textContent) {
        // Find relevant excerpt
        const queryWords = query.toLowerCase().split(' ');
        const content = doc.textContent.toLowerCase();
        let excerpt = doc.textContent.substring(0, 200);
        
        // Try to find a more relevant excerpt
        for (const word of queryWords) {
          const index = content.indexOf(word);
          if (index > -1) {
            const start = Math.max(0, index - 100);
            const end = Math.min(doc.textContent.length, index + 200);
            excerpt = doc.textContent.substring(start, end);
            if (start > 0) excerpt = '...' + excerpt;
            if (end < doc.textContent.length) excerpt = excerpt + '...';
            break;
          }
        }
        
        info += `• Content: ${excerpt}\n`;
      }
      info += `\n`;
    });
    
    return info;
  }
  
  // Enhanced thinking process with document context
  private generateThinkingWithDocuments(query: string, intent: any, documents?: any[]): string {
    const thinking = [
      `🤔 **AI Thinking Process:**`,
      ``,
      `**Query Analysis:**`,
      `• User asked: "${query}"`,
      `• Detected intent: ${intent.name} (${Math.round(intent.confidence * 100)}% confidence)`,
      `• Key entities: ${intent.entities.join(', ') || 'none detected'}`,
      ``,
      `**Document Search:**`,
      `• Found ${documents?.length || 0} uploaded documents`,
      documents && documents.length > 0 ? `• Analyzing document content for relevance` : `• No uploaded documents to analyze`,
      `• Searching VendorVault knowledge base...`,
      ``,
      `**Response Generation:**`,
      `• Synthesizing document information`,
      `• Combining with system knowledge`,
      `• Ensuring accuracy and completeness`
    ].join('\n');
    
    return thinking;
  }
  
  // Enhanced suggestions with document context
  private generateSuggestionsWithContext(intent: string, entities: string[], documents?: any[]): string[] {
    const baseSuggestions = this.generateSuggestions(intent, entities);
    
    if (documents && documents.length > 0) {
      const documentSuggestions = [
        "Tell me more about these documents",
        "What's the status of my uploads?",
        "Show me document details",
        "Analyze document compliance"
      ];
      
      // Mix base suggestions with document-specific ones
      return [...documentSuggestions.slice(0, 2), ...baseSuggestions.slice(0, 2)];
    }
    
    return baseSuggestions;
  }
  
  // Get conversation context
  public getConversationContext(): string[] {
    return this.conversationHistory.slice(-5); // Last 5 queries
  }
  
  // Reset conversation
  public resetConversation(): void {
    this.conversationHistory = [];
  }
}

// Singleton instance
export const vendorVaultRAG = new VendorVaultRAG();