'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  User,
  Send,
  Loader2,
  FileText,
  Building2,
  Lightbulb,
  Brain,
  Zap,
  Target,
  Shield,
} from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: string[];
  confidence?: number;
  thinking?: string;
  suggestions?: string[];
}

// Enhanced Quick Actions with VendorVault-specific queries

const quickActions = [
  {
    icon: Building2,
    title: "What is VendorVault?",
    description: "Learn about the project and capabilities",
    query: "What is VendorVault and what does it do?"
  },
  {
    icon: Shield,
    title: "User Roles",
    description: "Admin, vendor, and auditor roles",
    query: "Explain the different user roles in VendorVault"
  },
  {
    icon: Zap,
    title: "Key Features",
    description: "System features and functionality",
    query: "What are the main features of VendorVault?"
  },
  {
    icon: Brain,
    title: "AI Capabilities",
    description: "AI assistant and RAG system",
    query: "What can the AI assistant do and how does it work?"
  },
  {
    icon: Target,
    title: "Technical Details",
    description: "Technology stack and architecture",
    query: "How is VendorVault built technically?"
  },
  {
    icon: FileText,
    title: "Compliance Management",
    description: "Document and compliance workflows",
    query: "How does compliance management work in VendorVault?"
  }
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "🤖 **Welcome to VendorVault AI Assistant!**\n\nI'm your intelligent companion for all things VendorVault. I have deep knowledge about:\n\n• **Project Overview** - What VendorVault is and how it works\n• **User Roles** - Admin, Vendor, and Auditor capabilities\n• **Features** - Document management, compliance tracking, AI capabilities\n• **Technical Details** - Architecture, tech stack, and implementation\n• **Best Practices** - Compliance workflows and optimization tips\n\nI use advanced RAG (Retrieval-Augmented Generation) to provide accurate, contextual answers based on the actual VendorVault project. Try asking me anything about the system!",
      timestamp: new Date(),
      sources: ['VendorVault Knowledge Base'],
      confidence: 1.0
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
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

  const generateResponse = async (userMessage: string): Promise<{ 
    response: string; 
    sources: string[]; 
    suggestions?: string[];
    confidence?: number;
    thinking?: string;
  }> => {
    try {
      // Call the enhanced RAG API
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context: 'dashboard',
          userRole: 'admin' // You can make this dynamic based on user session
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API request failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        response: data.response || 'I apologize, but I encountered an issue processing your request.',
        sources: data.sources || ['AI Assistant'],
        suggestions: data.suggestions || [],
        confidence: data.confidence || 0.5,
        thinking: data.thinking || ''
      };

    } catch (error) {
      console.error('AI API Error:', error);
      
      // Enhanced fallback response
      return {
        response: `I apologize, but I'm having trouble connecting to my knowledge base right now. However, I can tell you that VendorVault is a comprehensive vendor compliance management system built with Next.js 15, React 19, and Supabase.\n\nPlease try asking your question again, or try one of the Quick Actions on the left.`,
        sources: ['Fallback System'],
        suggestions: ['What is VendorVault?', 'Show me the features', 'Explain user roles'],
        confidence: 0.3
      };
    }
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

    // Process with RAG engine
    setTimeout(async () => {
      try {
        const { response, sources, suggestions, confidence, thinking } = await generateResponse(messageToSend);
        
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: response || 'I apologize, but I encountered an issue processing your request.',
          timestamp: new Date(),
          sources: sources || ['AI Assistant'],
          confidence: confidence || 0.5,
          thinking: thinking || '',
          suggestions: suggestions || []
        };

        setMessages(prev => [...prev, assistantMessage]);
      } catch (error) {
        console.error('Error generating response:', error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          type: 'assistant',
          content: '❌ **System Error**\n\nI encountered an issue processing your request. This might be due to:\n\n• Network connectivity issues\n• API service temporarily unavailable\n• Invalid request format\n\nPlease try again in a moment, or try one of the Quick Actions on the left.',
          timestamp: new Date(),
          sources: ['Error Handler'],
          confidence: 0.1
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }, 2000); // Slightly longer delay to show the thinking process
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-4">
          <Card className="h-fit">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center text-base">
                <Lightbulb className="mr-2 h-4 w-4 text-yellow-500" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full h-auto p-3 text-left justify-start hover:bg-blue-50 hover:border-blue-200 transition-colors"
                    onClick={() => handleSendMessage(action.query)}
                  >
                    <div className="flex items-start space-x-3 w-full">
                      <Icon className="h-4 w-4 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 leading-tight">{action.title}</p>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed break-words">{action.description}</p>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-8">
          <Card className="h-[700px] flex flex-col shadow-lg border-0 bg-gradient-to-b from-gray-50 to-white overflow-hidden">
            <CardHeader className="border-b bg-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">VendorVault AI Assistant</h3>
                    <p className="text-sm text-gray-500">RAG-Powered • Project Expert</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    <span className="text-xs text-gray-500">RAG Engine</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500">Online</span>
                  </div>
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
                              <Brain className="h-4 w-4 text-white" />
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
                                    __html: (message.content || '')
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
                            
                            {message.type === 'assistant' && (
                              <div className="mt-4 space-y-3">
                                {/* Confidence Score */}
                                {message.confidence !== undefined && (
                                  <div className="pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-xs text-gray-500 font-medium">🎯 Confidence Score:</p>
                                      <span className="text-xs font-semibold text-gray-700">
                                        {Math.round(message.confidence * 100)}%
                                      </span>
                                    </div>
                                    <Progress 
                                      value={message.confidence * 100} 
                                      className="h-2"
                                    />
                                  </div>
                                )}
                                
                                {/* Sources */}
                                {message.sources && (
                                  <div className="pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">📚 Knowledge Sources:</p>
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
                                
                                {/* AI Thinking Process */}
                                {message.thinking && (
                                  <div className="pt-3 border-t border-gray-100">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setShowThinking(!showThinking)}
                                      className="text-xs text-gray-500 hover:text-gray-700 p-0 h-auto"
                                    >
                                      <Brain className="h-3 w-3 mr-1" />
                                      {showThinking ? 'Hide' : 'Show'} AI Thinking Process
                                    </Button>
                                    {showThinking && (
                                      <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                                        <pre className="text-xs text-gray-600 whitespace-pre-wrap font-mono">
                                          {message.thinking}
                                        </pre>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {/* Smart Suggestions */}
                                {message.suggestions && message.suggestions.length > 0 && (
                                  <div className="pt-3 border-t border-gray-100">
                                    <p className="text-xs text-gray-500 mb-2 font-medium">💡 Related Questions:</p>
                                    <div className="space-y-1">
                                      {message.suggestions.map((suggestion, index) => (
                                        <Button
                                          key={index}
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleSendMessage(suggestion)}
                                          className="text-xs text-left justify-start h-auto p-2 w-full bg-gray-50 hover:bg-gray-100 text-gray-700"
                                        >
                                          <Lightbulb className="h-3 w-3 mr-2 flex-shrink-0" />
                                          {suggestion}
                                        </Button>
                                      ))}
                                    </div>
                                  </div>
                                )}
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
                            <Brain className="h-4 w-4 text-white animate-pulse" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                              <span className="text-sm text-gray-600 font-medium">Analyzing your uploaded documents...</span>
                            </div>
                            <div className="text-xs text-gray-500 flex items-center space-x-2">
                              <FileText className="h-3 w-3" />
                              <span>Searching document content • RAG engine processing</span>
                            </div>
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
                  🧠 RAG-Powered: Ask me anything about VendorVault!
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