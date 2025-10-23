// VendorVault AI Knowledge Base - RAG Implementation
export interface KnowledgeEntry {
  id: string;
  category: string;
  content: string;
  keywords: string[];
  context: string;
  priority: number;
}

export interface ProjectContext {
  projectName: string;
  description: string;
  features: string[];
  roles: string[];
  techStack: string[];
  currentStatus: string;
}

// VendorVault Project Knowledge Base
export const PROJECT_CONTEXT: ProjectContext = {
  projectName: "VendorVault",
  description: "AI-powered vendor compliance management system built with Next.js 15, React 19, TypeScript, Supabase, and Tailwind CSS",
  features: [
    "Role-based authentication (Admin, Vendor, Auditor)",
    "Document management with drag & drop uploads",
    "Compliance checklist tracking",
    "AI-powered RAG assistant",
    "Real-time dashboard analytics",
    "Automated renewal reminders",
    "Risk assessment and scoring",
    "Vendor performance monitoring"
  ],
  roles: ["admin", "vendor", "auditor"],
  techStack: ["Next.js 15", "React 19", "TypeScript", "Supabase", "Tailwind CSS", "ShadCN UI", "Framer Motion"],
  currentStatus: "Production ready with all core features implemented"
};

// Comprehensive Knowledge Base
export const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  // Greetings and Basic Interactions
  {
    id: "greetings",
    category: "conversation",
    content: `Hello! 👋 Welcome to VendorVault AI Assistant!

I'm your intelligent companion for everything related to VendorVault - the comprehensive vendor compliance management system. I'm powered by advanced RAG (Retrieval-Augmented Generation) technology and have deep knowledge about:

🏢 **VendorVault Overview**: What it is, how it works, and its purpose
👥 **User Roles**: Admin, Vendor, and Auditor capabilities and permissions  
⚡ **Features**: Document management, compliance tracking, AI capabilities
🛠️ **Technical Details**: Architecture, tech stack, and implementation
📋 **Compliance Management**: Workflows, processes, and best practices
🤖 **AI Capabilities**: How I work and what I can help you with

Feel free to ask me anything about VendorVault! I can explain features, guide you through processes, or help you understand how the system works.

**Popular questions to get started:**
• "What is VendorVault?"
• "What are the different user roles?"
• "Show me the main features"
• "How does the AI assistant work?"`,
    keywords: ["hi", "hello", "hey", "greetings", "start", "begin", "welcome"],
    context: "Greeting and introduction",
    priority: 15
  },

  // Project Overview
  {
    id: "project-overview",
    category: "project",
    content: `VendorVault is a comprehensive vendor compliance management platform that streamlines document verification, compliance tracking, and vendor relationships using AI-powered insights. Built with Next.js 15, React 19, TypeScript, Supabase, and modern UI components.

Key Features:
- Role-based access control (Admin, Vendor, Auditor)
- Document management with secure file storage
- Dynamic compliance checklists
- AI-powered RAG assistant for intelligent insights
- Real-time dashboard with analytics
- Automated renewal tracking and reminders
- Risk assessment and vendor scoring
- Responsive design with Tailwind CSS and ShadCN UI`,
    keywords: ["vendorvault", "project", "overview", "what is", "about", "description"],
    context: "General project information",
    priority: 10
  },

  // User Roles
  {
    id: "user-roles",
    category: "roles",
    content: `VendorVault has 3 main user roles:

🛡️ ADMIN ROLE:
- Vendor Management: Create, approve, suspend, or activate vendor accounts
- Document Oversight: Review and verify all uploaded documents
- Compliance Monitoring: Track overall compliance across all vendors
- User Management: Manage user accounts and role assignments
- System Administration: Configure checklist requirements and system settings
- Analytics: Access comprehensive dashboard with system-wide metrics

🏢 VENDOR ROLE:
- Document Upload: Submit compliance documents (certificates, licenses, etc.)
- Checklist Completion: Work through required compliance items
- Status Tracking: Monitor document approval status and renewals
- AI Assistance: Get help with compliance questions
- Profile Management: Update company information and contacts

🔍 AUDITOR ROLE:
- Document Review: Verify and approve/reject vendor documents
- Compliance Assessment: Evaluate vendor compliance status
- Risk Analysis: Identify potential compliance risks
- Reporting: Generate audit reports and recommendations
- Quality Control: Ensure document standards are met`,
    keywords: ["roles", "admin", "vendor", "auditor", "permissions", "access", "users"],
    context: "User roles and permissions",
    priority: 9
  },

  // Technical Architecture
  {
    id: "tech-stack",
    category: "technical",
    content: `VendorVault Technical Stack:

Frontend:
- Next.js 15 with App Router
- React 19 with TypeScript
- Tailwind CSS for styling
- ShadCN UI components
- Framer Motion for animations
- Lucide React icons

Backend:
- Next.js API Routes
- Supabase (PostgreSQL database)
- Supabase Auth for authentication
- Supabase Storage for file management
- Row Level Security (RLS)

AI & RAG:
- OpenRouter API integration
- Supabase pgvector for embeddings
- Context-aware responses
- Document analysis capabilities

Deployment:
- Vercel for hosting
- Environment variables for configuration
- Optimized build process`,
    keywords: ["tech", "stack", "technology", "architecture", "nextjs", "react", "supabase", "typescript"],
    context: "Technical implementation details",
    priority: 7
  },

  // Features and Functionality
  {
    id: "features",
    category: "features",
    content: `VendorVault Core Features:

📊 Smart Dashboard:
- Real-time compliance statistics
- Upcoming renewal alerts
- Performance metrics
- Role-specific views

📄 Document Management:
- Drag & drop file uploads
- Support for PDF, DOC, DOCX, images
- Document status workflow (Uploaded → Verified → Rejected)
- Expiration date monitoring
- Secure file storage with Supabase

✅ Dynamic Compliance Checklist:
- Tax Certificate
- Business License
- Insurance Certificate
- ISO Certification
- Data Privacy Policy
- Security Compliance
- Financial Statements
- References

🤖 AI Assistant (RAG):
- Intelligent compliance Q&A
- Document analysis and insights
- Risk assessment recommendations
- Natural language queries
- Context-aware responses

🔒 Security Features:
- Role-based access control
- Secure file uploads and storage
- Session management
- Row-level security (RLS)
- Data encryption at rest`,
    keywords: ["features", "functionality", "dashboard", "documents", "checklist", "ai", "security"],
    context: "System features and capabilities",
    priority: 8
  },

  // Compliance Management
  {
    id: "compliance",
    category: "compliance",
    content: `VendorVault Compliance Management:

Document Types Tracked:
- Tax Certificates
- Business Licenses
- Insurance Certificates
- ISO Certifications (27001, 9001, etc.)
- Data Privacy Policies
- Security Compliance Documents
- Financial Statements
- Professional References

Status Workflow:
1. Uploaded - Document submitted by vendor
2. Under Review - Being verified by admin/auditor
3. Verified - Approved and compliant
4. Rejected - Requires resubmission
5. Expired - Needs renewal

Compliance Scoring:
- Automated risk assessment
- Real-time compliance percentage
- Vendor performance tracking
- Trend analysis and reporting

Renewal Management:
- Automated expiration tracking
- Email reminders (90/30/7 days)
- Calendar integration
- Vendor self-service portal`,
    keywords: ["compliance", "documents", "certificates", "renewal", "tracking", "verification"],
    context: "Compliance management processes",
    priority: 9
  },

  // AI Assistant Capabilities
  {
    id: "ai-capabilities",
    category: "ai",
    content: `VendorVault AI Assistant Capabilities:

🎯 Intelligent Analysis:
- Real-time compliance scoring and risk assessment
- Trend analysis and predictive insights
- Custom reports and dashboards
- Benchmark comparisons

📋 Document Intelligence:
- Automated document classification
- Content extraction and validation
- Expiration date detection
- Compliance gap identification

🔄 Process Automation:
- Workflow optimization suggestions
- Automated email templates
- Calendar integration and scheduling
- Vendor onboarding guidance

💡 Smart Recommendations:
- Proactive compliance suggestions
- Cost optimization opportunities
- Process improvement recommendations
- Industry best practices

🤖 Natural Language Processing:
- Context-aware responses
- Multi-turn conversations
- Document Q&A capabilities
- Risk assessment explanations`,
    keywords: ["ai", "assistant", "intelligence", "automation", "recommendations", "analysis"],
    context: "AI assistant features and capabilities",
    priority: 8
  },

  // Help and Support
  {
    id: "help-support",
    category: "conversation",
    content: `I'm here to help you understand and work with VendorVault! Here are some ways I can assist:

🎯 **What I Can Help With:**
• Explain VendorVault features and functionality
• Guide you through user roles and permissions
• Describe technical architecture and implementation
• Provide compliance management guidance
• Answer questions about AI capabilities
• Offer best practices and recommendations

💡 **How to Get the Best Answers:**
• Ask specific questions about VendorVault features
• Inquire about user roles (Admin, Vendor, Auditor)
• Request technical details about the system
• Ask about compliance workflows and processes

🚀 **Popular Topics:**
• "What is VendorVault and how does it work?"
• "Explain the different user roles and their capabilities"
• "What are the main features of the system?"
• "How is VendorVault built technically?"
• "How does document management work?"

Feel free to ask me anything about VendorVault - I'm powered by advanced RAG technology and have comprehensive knowledge about the entire system!`,
    keywords: ["help", "support", "assist", "guide", "how to", "can you", "please"],
    context: "Help and support guidance",
    priority: 9
  },

  // Thank You and Positive Responses
  {
    id: "thanks-positive",
    category: "conversation",
    content: `You're very welcome! 😊 I'm glad I could help you learn more about VendorVault.

Is there anything else you'd like to know about:
• VendorVault features and capabilities
• User roles and permissions
• Technical implementation details
• Compliance management processes
• AI assistant functionality

I'm here whenever you need assistance with VendorVault! Feel free to ask me anything else.`,
    keywords: ["thank", "thanks", "appreciate", "helpful", "great", "awesome", "perfect"],
    context: "Positive feedback and thanks",
    priority: 8
  }
];

// RAG Search Function
export function searchKnowledge(query: string, limit: number = 5): KnowledgeEntry[] {
  const queryLower = query.toLowerCase().trim();
  const words = queryLower.split(/\s+/).filter(word => word.length > 2);
  
  // Check for exact greeting matches first
  const greetingWords = ['hi', 'hello', 'hey', 'greetings'];
  const isSimpleGreeting = greetingWords.includes(queryLower) || 
    greetingWords.some(greeting => queryLower === greeting);
  
  const scored = KNOWLEDGE_BASE.map(entry => {
    let score = 0;
    
    // Special handling for simple greetings
    if (isSimpleGreeting && entry.id === 'greetings') {
      return { ...entry, score: 1000 }; // Highest priority for greetings
    }
    
    // Skip greeting entry for non-greeting queries
    if (!isSimpleGreeting && entry.id === 'greetings') {
      return { ...entry, score: 0 };
    }
    
    // Exact keyword matches (highest priority)
    entry.keywords.forEach(keyword => {
      const keywordLower = keyword.toLowerCase();
      if (queryLower === keywordLower) {
        score += entry.priority * 3; // Exact match bonus
      } else if (queryLower.includes(keywordLower)) {
        score += entry.priority * 2;
      }
    });
    
    // Content matches
    words.forEach(word => {
      if (entry.content.toLowerCase().includes(word)) {
        score += entry.priority * 0.5;
      }
    });
    
    // Category matches
    if (entry.category.toLowerCase().includes(queryLower)) {
      score += entry.priority * 1.5;
    }
    
    // Title/ID matches
    if (entry.id.toLowerCase().includes(queryLower)) {
      score += entry.priority * 1.2;
    }
    
    return { ...entry, score };
  });
  
  return scored
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// Context-aware response generation
export function generateContextualResponse(query: string): {
  response: string;
  sources: string[];
  confidence: number;
} {
  const queryLower = query.toLowerCase().trim();
  
  // Check for simple greetings first
  const greetingWords = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
  const isGreeting = greetingWords.some(greeting => 
    queryLower === greeting || 
    queryLower.startsWith(greeting + ' ') || 
    queryLower.endsWith(' ' + greeting)
  );
  
  if (isGreeting) {
    const greetingEntry = KNOWLEDGE_BASE.find(entry => entry.id === 'greetings');
    if (greetingEntry) {
      return {
        response: greetingEntry.content,
        sources: [greetingEntry.context],
        confidence: 0.95
      };
    }
  }
  
  const relevantKnowledge = searchKnowledge(query, 3);
  
  if (relevantKnowledge.length === 0) {
    return {
      response: "I don't have specific information about that topic in my VendorVault knowledge base. Could you please rephrase your question or ask about vendor management, compliance, documents, or AI features?",
      sources: ["AI Assistant"],
      confidence: 0.3
    };
  }
  
  const primaryKnowledge = relevantKnowledge[0];
  const confidence = Math.min(primaryKnowledge.score / 50, 1.0);
  
  // Generate contextual response based on knowledge
  let response = "";
  
  // For greetings, use the content directly
  if (primaryKnowledge.category === 'conversation') {
    response = primaryKnowledge.content;
  } else {
    // For other topics, add context
    response = `**🏢 ${PROJECT_CONTEXT.projectName}** - ${primaryKnowledge.context}\n\n`;
    response += primaryKnowledge.content;
  }
  
  if (relevantKnowledge.length > 1 && primaryKnowledge.category !== 'conversation') {
    response += "\n\n**Related Information:**\n";
    relevantKnowledge.slice(1).forEach((entry, index) => {
      response += `• ${entry.context}\n`;
    });
  }
  
  const sources = relevantKnowledge.map(entry => entry.context);
  
  return {
    response,
    sources: [...new Set(sources)],
    confidence
  };
}