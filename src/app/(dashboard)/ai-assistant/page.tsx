'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Bot,
  User,
  Send,
  Loader2,
  FileText,
  Building2,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
}

// Enhanced AI responses with better intelligence and context
const mockResponses = [
  {
    trigger: ['compliance', 'status', 'overview', 'summary'],
    response: "📊 **Vendor Compliance Overview**\n\nBased on your current portfolio analysis:\n\n**Overall Health Score: 78/100** ⭐\n\n**Compliance Breakdown:**\n• ✅ **Fully Compliant:** 2 vendors (40%)\n• ⚠️ **Minor Issues:** 2 vendors (40%) \n• 🚨 **Action Required:** 1 vendor (20%)\n\n**Key Insights:**\n• Your compliance rate has improved 12% this quarter\n• Average document processing time: 3.2 days\n• Next critical deadline: Jan 31 (ISO Certificate renewal)\n\n**Recommended Actions:**\n1. Focus on DataFlow Systems (high-risk vendor)\n2. Schedule quarterly reviews with medium-risk vendors\n3. Implement automated renewal reminders\n\nWould you like me to dive deeper into any specific area?",
    sources: ['Vendor Database', 'Compliance Analytics', 'Risk Engine']
  },
  {
    trigger: ['missing', 'documents', 'requirements', 'pending'],
    response: "📋 **Missing Documents Analysis**\n\n**Critical Priority (5 items):**\n\n🔴 **Immediate Action Required:**\n• SecureData Inc: Insurance Certificate\n  - Due: Feb 15, 2024 (12 days remaining)\n  - Impact: High - Required for contract renewal\n  - Contact: sarah@securedata.com\n\n🟡 **Medium Priority:**\n• CloudFirst Ltd: Updated Privacy Policy\n  - Due: Mar 1, 2024 (28 days remaining)\n  - Impact: Medium - GDPR compliance requirement\n\n• DataFlow Systems: Financial Statements (Q4 2023)\n  - Overdue by 15 days\n  - Impact: High - Affects credit rating assessment\n\n**Automation Suggestions:**\n• Set up email reminders 30/15/7 days before due dates\n• Create document templates for vendors\n• Enable vendor self-service portal\n\n**Next Steps:**\nShall I draft reminder emails for the critical items or help you set up automated workflows?",
    sources: ['Document Management', 'Renewal Tracker', 'Vendor Communications']
  },
  {
    trigger: ['renewal', 'expiring', 'due', 'upcoming'],
    response: "⏰ **Document Renewal Dashboard**\n\n**Next 30 Days - Critical Timeline:**\n\n**🚨 URGENT (Next 7 days):**\n• **TechCorp Solutions** - ISO 27001 Certificate\n  - Expires: January 31, 2024 (3 days!)\n  - Status: Renewal in progress ✅\n  - Contact: John Smith (john@techcorp.com)\n  - Action: Follow up on renewal status\n\n**⚠️ HIGH PRIORITY (Next 2 weeks):**\n• **SecureData Inc** - Business License\n  - Expires: February 10, 2024 (12 days)\n  - Status: No response to reminders ❌\n  - Last contact: January 15, 2024\n  - Action: Escalate to procurement team\n\n**📅 MEDIUM PRIORITY (Next 30 days):**\n• **CloudFirst Ltd** - Insurance Policy\n  - Expires: February 28, 2024 (30 days)\n  - Status: Vendor notified ✅\n  - Expected renewal: February 20, 2024\n\n**Smart Recommendations:**\n• Schedule weekly check-ins for urgent items\n• Consider backup vendors for non-responsive suppliers\n• Implement 90-day advance renewal process\n\nWould you like me to generate renewal reminder templates or create calendar alerts?",
    sources: ['Renewal Management', 'Calendar Integration', 'Vendor Communications']
  },
  {
    trigger: ['risk', 'assessment', 'analysis', 'score'],
    response: "🎯 **Comprehensive Risk Assessment**\n\n**Portfolio Risk Score: 6.2/10** (Moderate Risk)\n\n**Risk Distribution:**\n\n🟢 **LOW RISK (2 vendors - 40%)**\n• **TechCorp Solutions** - Score: 8.9/10\n  - Strengths: Perfect compliance history, proactive communication\n  - Financial health: Excellent (A+ rating)\n  - Relationship: 3+ years, strategic partner\n\n• **NetworkPro Services** - Score: 8.1/10\n  - Strengths: ISO certified, regular audits\n  - Minor: Occasional late document submissions\n\n🟡 **MEDIUM RISK (2 vendors - 40%)**\n• **CloudFirst Ltd** - Score: 6.5/10\n  - Concerns: Missing recent security audit\n  - Mitigation: Scheduled audit for March 2024\n  - Financial: Stable, growing company\n\n• **SecureData Inc** - Score: 5.8/10\n  - Concerns: Slow response times, document delays\n  - Mitigation: Quarterly business reviews implemented\n\n🔴 **HIGH RISK (1 vendor - 20%)**\n• **DataFlow Systems** - Score: 3.2/10\n  - Critical Issues: Suspended vendor status\n  - Missing: Insurance, financial statements, security certs\n  - Recommendation: **Immediate review required**\n  - Alternative vendors identified: 3 options available\n\n**Strategic Recommendations:**\n1. **Immediate:** Conduct DataFlow Systems review meeting\n2. **Short-term:** Diversify vendor portfolio (reduce single points of failure)\n3. **Long-term:** Implement continuous monitoring dashboard\n\nWould you like me to generate a detailed remediation plan or identify alternative vendors?",
    sources: ['Risk Analytics', 'Vendor Scoring', 'Financial Data', 'Compliance History']
  },
  {
    trigger: ['help', 'what can you do', 'capabilities', 'features'],
    response: "🤖 **VendorVault AI Assistant Capabilities**\n\nI'm your intelligent compliance companion! Here's how I can help:\n\n**📊 Analytics & Insights**\n• Real-time compliance scoring and risk assessment\n• Trend analysis and predictive insights\n• Custom reports and dashboards\n• Benchmark comparisons\n\n**📋 Document Management**\n• Track missing documents and requirements\n• Automated renewal reminders and alerts\n• Document validation and compliance checking\n• Template generation and standardization\n\n**🎯 Risk Management**\n• Vendor risk scoring and categorization\n• Early warning systems for compliance issues\n• Alternative vendor recommendations\n• Mitigation strategy development\n\n**🔄 Process Automation**\n• Workflow optimization suggestions\n• Automated email templates and communications\n• Calendar integration and scheduling\n• Vendor onboarding guidance\n\n**💡 Smart Recommendations**\n• Proactive compliance suggestions\n• Cost optimization opportunities\n• Process improvement recommendations\n• Industry best practices\n\n**Try asking me:**\n• \"Show me high-risk vendors\"\n• \"What documents expire this month?\"\n• \"How can I improve our compliance rate?\"\n• \"Generate a vendor performance report\"\n\nWhat would you like to explore first?",
    sources: ['AI Knowledge Base', 'Feature Documentation']
  }
];

const quickActions = [
  {
    icon: Building2,
    title: "Vendor Overview",
    description: "Get compliance status for all vendors",
    query: "Show me the compliance status overview for all vendors"
  },
  {
    icon: FileText,
    title: "Missing Documents",
    description: "Find what documents are still needed",
    query: "What documents are missing from our vendors?"
  },
  {
    icon: AlertTriangle,
    title: "Upcoming Renewals",
    description: "Check for expiring certificates",
    query: "Show me upcoming document renewals and expirations"
  },
  {
    icon: CheckCircle,
    title: "Risk Analysis",
    description: "Analyze vendor risk levels",
    query: "Provide a risk assessment for our vendor portfolio"
  }
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your VendorVault AI Assistant. I can help you with compliance questions, document analysis, risk assessments, and vendor management insights. What would you like to know?",
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateResponse = (userMessage: string): { response: string; sources: string[] } => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Enhanced pattern matching with more intelligent responses
    for (const mockResponse of mockResponses) {
      if (mockResponse.trigger.some(trigger => lowerMessage.includes(trigger))) {
        return {
          response: mockResponse.response,
          sources: mockResponse.sources
        };
      }
    }
    
    // Context-aware default responses based on keywords
    if (lowerMessage.includes('vendor') || lowerMessage.includes('supplier')) {
      return {
        response: "🏢 **Vendor Management Assistance**\n\nI can help you with various vendor-related tasks:\n\n**📊 Analytics:**\n• Vendor performance analysis\n• Compliance scoring and tracking\n• Risk assessment and monitoring\n\n**📋 Operations:**\n• Document management and tracking\n• Renewal scheduling and reminders\n• Onboarding process optimization\n\n**🎯 Strategic Insights:**\n• Cost optimization opportunities\n• Vendor diversification recommendations\n• Industry benchmarking\n\nWhat specific aspect of vendor management would you like to explore? Try asking about compliance status, risk analysis, or upcoming renewals.",
        sources: ['Vendor Management System', 'AI Knowledge Base']
      };
    }
    
    if (lowerMessage.includes('document') || lowerMessage.includes('file') || lowerMessage.includes('certificate')) {
      return {
        response: "📄 **Document Management Support**\n\nI can assist with all document-related queries:\n\n**Current Status:**\n• Track missing or pending documents\n• Monitor expiration dates and renewals\n• Validate document compliance requirements\n\n**Automation:**\n• Set up automated reminders\n• Generate document request templates\n• Create compliance checklists\n\n**Analysis:**\n• Document processing time analysis\n• Compliance gap identification\n• Vendor response time tracking\n\nTry asking: \"What documents are missing?\" or \"Show me expiring certificates\"",
        sources: ['Document Management', 'Compliance Tracker']
      };
    }
    
    // Friendly default response
    return {
      response: "👋 **Hello! I'm here to help with your vendor compliance needs.**\n\nI specialize in:\n\n🎯 **Quick Insights:**\n• Compliance status overviews\n• Risk assessments and scoring\n• Document tracking and renewals\n• Vendor performance analytics\n\n💡 **Smart Suggestions:**\n• Process optimization recommendations\n• Automated workflow setup\n• Best practice guidance\n• Proactive risk mitigation\n\n**Popular Questions:**\n• \"Show me our compliance overview\"\n• \"What documents are expiring soon?\"\n• \"Which vendors need attention?\"\n• \"How can I improve our processes?\"\n\nOr try one of the Quick Actions on the left! What would you like to know?",
      sources: ['AI Assistant', 'Help System']
    };
  };

  const handleSendMessage = async (message?: string) => {
    const messageToSend = message || inputValue.trim();
    if (!messageToSend) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI processing delay
    setTimeout(() => {
      const { response, sources } = generateResponse(messageToSend);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response,
        timestamp: new Date(),
        sources,
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Assistant</h1>
          <p className="text-gray-600 mt-1">
            Get intelligent insights about your vendor compliance
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lightbulb className="mr-2 h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-auto p-4 text-left justify-start"
                    onClick={() => handleSendMessage(action.query)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="h-[700px] flex flex-col shadow-lg border-0 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
            <CardHeader className="border-b bg-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <Bot className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">VendorVault AI Assistant</h3>
                    <p className="text-sm text-gray-500">Online • Ready to help</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-gray-500">Active</span>
                </div>
              </CardTitle>
            </CardHeader>
            
            {/* Messages */}
            <CardContent className="flex-1 p-0 bg-gradient-to-b from-gray-50/50 to-white overflow-hidden">
              <ScrollArea className="h-full p-6 overflow-hidden" ref={scrollAreaRef}>
                <div className="space-y-6 max-w-full">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 shadow-sm break-words overflow-hidden ${
                          message.type === 'user'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white ml-auto'
                            : 'bg-white border border-gray-200 text-gray-900'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {message.type === 'assistant' && (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                          {message.type === 'user' && (
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm leading-relaxed overflow-hidden ${
                              message.type === 'assistant' ? 'prose prose-sm max-w-none' : ''
                            }`}>
                              {message.type === 'assistant' ? (
                                <div 
                                  className="whitespace-pre-wrap break-words overflow-wrap-anywhere"
                                  dangerouslySetInnerHTML={{
                                    __html: message.content
                                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                                      .replace(/^(#{1,3})\s(.+)$/gm, '<h$1 class="font-bold text-gray-900 mb-2">$2</h$1>')
                                      .replace(/^•\s(.+)$/gm, '<div class="flex items-start space-x-2 mb-1"><span class="text-blue-500 font-bold">•</span><span class="break-words">$1</span></div>')
                                      .replace(/^(\d+\.)\s(.+)$/gm, '<div class="flex items-start space-x-2 mb-1"><span class="text-blue-600 font-semibold">$1</span><span class="break-words">$2</span></div>')
                                      .replace(/(🔴|🟡|🟢|⚠️|✅|❌|📊|📋|🎯|💡|🤖|📄|👋|⏰|🚨)/g, '<span class="text-lg">$1</span>')
                                  }}
                                />
                              ) : (
                                <div className="whitespace-pre-wrap break-words">{message.content}</div>
                              )}
                            </div>
                            
                            {message.sources && (
                              <div className="mt-4 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-2 font-medium">📚 Sources:</p>
                                <div className="flex flex-wrap gap-2">
                                  {message.sources.map((source, index) => (
                                    <Badge 
                                      key={index} 
                                      variant="outline" 
                                      className="text-xs bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                                    >
                                      {source}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className={`mt-3 text-xs ${
                              message.type === 'user' ? 'text-white/70' : 'text-gray-400'
                            }`}>
                              {formatTime(message.timestamp)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-[85%] shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                            <span className="text-sm text-gray-600 font-medium">AI is analyzing your request...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
            
            {/* Input */}
            <div className="border-t bg-white p-4 rounded-b-lg">
              <div className="flex space-x-3">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me about vendor compliance, documents, risk analysis, or anything else..."
                    className="pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl bg-gray-50 focus:bg-white transition-colors"
                    disabled={isLoading}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="flex items-center space-x-1 text-xs text-gray-400">
                      <span>⌘</span>
                      <span>↵</span>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="h-12 px-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-gray-500">
                  💡 Try: "Show compliance overview" or "What needs attention?"
                </p>
                <p className="text-xs text-gray-400">
                  Press Enter to send • Shift+Enter for new line
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}