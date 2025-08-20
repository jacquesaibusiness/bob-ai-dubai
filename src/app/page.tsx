"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, TrendingUp, BarChart3, MapPin } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock data for visualization
const priceData = [
  { area: 'Marina', avgPrice: 2100000, roi: 5.2 },
  { area: 'JVC', avgPrice: 950000, roi: 7.8 },
  { area: 'Business Bay', avgPrice: 1800000, roi: 6.4 },
  { area: 'Downtown', avgPrice: 3200000, roi: 4.8 },
  { area: 'Dubai South', avgPrice: 850000, roi: 8.1 }
];

const trendData = [
  { month: 'Jan', price: 1800000 },
  { month: 'Feb', price: 1850000 },
  { month: 'Mar', price: 1920000 },
  { month: 'Apr', price: 1980000 },
  { month: 'May', price: 2100000 },
  { month: 'Jun', price: 2150000 }
];

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  hasChart?: boolean;
  chartType?: 'price' | 'trend' | 'roi';
}

const BulletPointFormatter: React.FC<{ content: string }> = ({ content }) => {
  const cleanText = (text: string) => {
    // Remove all markdown formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold**
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic*
      .replace(/__(.*?)__/g, '$1')     // Remove __bold__
      .replace(/_(.*?)_/g, '$1');      // Remove _italic_
  };

  const addMinimalEmoji = (text: string) => {
    // Only add emoji to DLD fee structure header
    if (text.includes('Current DLD Fee Structure:')) {
      return '💰 Current DLD Fee Structure:';
    }
    return text;
  };

  const formatContent = (text: string) => {
    const cleanedText = cleanText(text);
    
    // Handle existing bullet points and line breaks
    if (cleanedText.includes('•') || cleanedText.includes('-') || cleanedText.includes('\n')) {
      const lines = cleanedText.split('\n').filter(line => line.trim());
      return lines.map((line, index) => {
        const trimmedLine = line.trim();
        
        // Handle bullet points
        if (trimmedLine.match(/^[-•*]\s/)) {
          const content = trimmedLine.replace(/^[-•*]\s/, '');
          return (
            <div key={index} className="mb-2 flex items-start">
              <span className="text-cyan-400 mr-3 mt-1 flex-shrink-0">•</span>
              <span className="flex-1">{content}</span>
            </div>
          );
        }
        
        // Handle section headers (lines ending with :)
        if (trimmedLine.endsWith(':') && trimmedLine.length < 60) {
          return (
            <div key={index} className="font-semibold text-cyan-300 mt-3 mb-2">
              {addMinimalEmoji(trimmedLine)}
            </div>
          );
        }
        
        // Regular paragraphs
        return (
          <div key={index} className="mb-3 leading-relaxed">
            {trimmedLine}
          </div>
        );
      });
    }

    // Smart formatting for plain text responses
    const sentences = cleanedText.split(/(?<=[.!?])\s+/);
    const formattedContent = [];
    let currentBulletGroup = [];
    
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i].trim();
      
      if (!sentence) continue;
      
      // Detect fee/cost information patterns
      if (sentence.includes('AED') || 
          sentence.includes('fee') || 
          sentence.includes('cost') || 
          sentence.includes('charge') ||
          sentence.includes('%')) {
        
        currentBulletGroup.push(
          <div key={`bullet-${i}`} className="mb-2 flex items-start">
            <span className="text-cyan-400 mr-3 mt-1 flex-shrink-0">•</span>
            <span className="flex-1">{sentence}</span>
          </div>
        );
      } else {
        // Flush any accumulated bullet points
        if (currentBulletGroup.length > 0) {
          formattedContent.push(
            <div key={`group-${i}`} className="space-y-1 mb-4">
              {currentBulletGroup}
            </div>
          );
          currentBulletGroup = [];
        }
        
        // Add regular paragraph
        formattedContent.push(
          <div key={`para-${i}`} className="mb-3 leading-relaxed">
            {sentence}
          </div>
        );
      }
    }
    
    // Flush any remaining bullet points
    if (currentBulletGroup.length > 0) {
      formattedContent.push(
        <div key="final-group" className="space-y-1">
          {currentBulletGroup}
        </div>
      );
    }
    
    return formattedContent;
  };

  return (
    <div className="space-y-1">
      {formatContent(content)}
    </div>
  );
};

const PropertyChart: React.FC<{ type: string }> = ({ type }) => {
  if (type === 'trend') {
    return (
      <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
        <h4 className="text-cyan-400 text-sm font-medium mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2" />
          Dubai Marina Price Trend (2025)
        </h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} tickFormatter={(value) => `${(value/1000000).toFixed(1)}M`} />
            <Tooltip 
              formatter={(value) => [`AED ${(value as number).toLocaleString()}`, 'Price']}
              labelStyle={{ color: '#0f172a' }}
              contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4' }}
            />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="#06b6d4" 
              strokeWidth={2}
              dot={{ fill: '#06b6d4', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="mt-4 p-4 bg-slate-800/50 rounded-lg border border-cyan-500/20">
      <h4 className="text-cyan-400 text-sm font-medium mb-3 flex items-center">
        <BarChart3 className="w-4 h-4 mr-2" />
        ROI Comparison by Area
      </h4>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={priceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="area" stroke="#64748b" fontSize={12} />
          <YAxis stroke="#64748b" fontSize={12} />
          <Tooltip 
            formatter={(value, name) => [
              name === 'roi' ? `${value}%` : `AED ${(value as number).toLocaleString()}`,
              name === 'roi' ? 'ROI' : 'Avg Price'
            ]}
            labelStyle={{ color: '#0f172a' }}
            contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #06b6d4' }}
          />
          <Bar dataKey="roi" fill="#06b6d4" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  return (
    <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`flex max-w-[80%] ${message.isBot ? '' : 'flex-row-reverse'}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          message.isBot 
            ? 'bg-gradient-to-br from-green-500 to-green-600 mr-3' 
            : 'bg-gradient-to-br from-cyan-500 to-cyan-600 ml-3'
        }`}>
          {message.isBot ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
        </div>
        
        <div className={`rounded-2xl px-4 py-3 ${
          message.isBot
            ? 'bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 shadow-lg shadow-cyan-500/10'
            : 'bg-gradient-to-br from-cyan-600 to-cyan-700 text-white'
        }`}>
          {message.isBot ? (
            <div>
              <div className="text-cyan-400 text-xs font-medium mb-1">Bob</div>
              <div className="text-gray-100 text-sm leading-relaxed">
                <BulletPointFormatter content={message.text} />
              </div>
              {message.hasChart && message.chartType && (
                <PropertyChart type={message.chartType} />
              )}
            </div>
          ) : (
            <div className="text-sm leading-relaxed">{message.text}</div>
          )}
          
          <div className={`text-xs mt-2 ${message.isBot ? 'text-gray-500' : 'text-cyan-100'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChatInput: React.FC<{ onSend: (message: string) => void; isLoading: boolean }> = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSend(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask Bob about Dubai real estate..."
              className="w-full p-4 pr-12 bg-slate-800/90 backdrop-blur-lg border border-cyan-500/30 rounded-2xl 
                       text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:border-cyan-400
                       focus:ring-2 focus:ring-cyan-400/20 shadow-lg min-h-[56px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
            {isLoading && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent"></div>
              </div>
            )}
          </div>
          
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 
                     disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                     rounded-2xl transition-all duration-200 shadow-lg shadow-cyan-500/20
                     hover:shadow-cyan-400/30 hover:scale-105 active:scale-95"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function BobAIDubai() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome! I'm Bob, your Dubai real estate advisor. I can help you with property investment analysis, market insights, and legal guidance. What would you like to explore?",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      handleSendMessage(input.trim());
      setInput('');
    }
  };

  const handleSendMessage = async (message: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call your n8n legal_short_workflow
      const response = await fetch('https://jacquesaibusiness.app.n8n.cloud/webhook/bob/legal/short', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message,
          session_id: `session_${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.text();
      
      // Parse JSON if response contains {"output":"..."}
      let cleanResponse = data;
      try {
        const parsed = JSON.parse(data);
        if (parsed.output) {
          cleanResponse = parsed.output;
        }
      } catch (e) {
        // Keep original response if not JSON
      }

      // Create bot response
      const botResponse: Message = {
        id: Date.now().toString(),
        text: cleanResponse,
        isBot: true,
        timestamp: new Date(),
        hasChart: false // No charts for legal short responses
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('Error calling n8n workflow:', error);
      
      // Fallback error message
      const errorResponse: Message = {
        id: Date.now().toString(),
        text: `Sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.`,
        isBot: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <div className="relative z-10 p-6 border-b border-cyan-500/20 bg-slate-900/80 backdrop-blur-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  BOB AI
                </h1>
                <p className="text-gray-400 text-sm">Dubai Real Estate Intelligence</p>
              </div>
            </div>
            
            <div className="flex-1"></div>
            
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="relative z-10 pb-40 pt-6">
        <div className="max-w-4xl mx-auto px-6">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex max-w-[80%]">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 mr-3 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-cyan-500/30 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Chat Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-slate-900 via-slate-900 to-transparent z-50">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-end space-x-3">
            <div className="flex-1 relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Ask Bob about Dubai real estate..."
                className="w-full p-4 pr-12 bg-slate-800/95 backdrop-blur-lg border border-cyan-500/30 rounded-2xl 
                         text-gray-100 placeholder-gray-400 resize-none focus:outline-none focus:border-cyan-400
                         focus:ring-2 focus:ring-cyan-400/20 shadow-lg min-h-[56px] max-h-32"
                rows={1}
                disabled={isLoading}
              />
              {isLoading && (
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-cyan-400 border-t-transparent"></div>
                </div>
              )}
            </div>
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-4 bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 
                       disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed
                       rounded-2xl transition-all duration-200 shadow-lg shadow-cyan-500/20
                       hover:shadow-cyan-400/30 hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}