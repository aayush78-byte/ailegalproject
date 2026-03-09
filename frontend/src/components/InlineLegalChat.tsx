import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Scale, Sparkles, BookOpen, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import ReactMarkdown from 'react-markdown';
import { ContractIssue } from '../api';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface InlineLegalChatProps {
  issues: ContractIssue[];
}

const suggestedQuestions = [
  "What is Section 27?",
  "Explain undue influence",
  "What is Section 182?",
  "What is restraint of trade?",
  "Explain fraud under Section 17",
  "What happens if agent exceeds authority?",
  "Explain coercion",
  "What is Section 74 about penalties?",
];

const InlineLegalChat: React.FC<InlineLegalChatProps> = ({ issues }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate context-aware suggestions based on detected issues
  const contextualSuggestions = issues.length > 0 
    ? [...new Set(issues.map(i => {
        const sectionMatch = i.law_cited.match(/Section (\d+)/);
        return sectionMatch ? `What is Section ${sectionMatch[1]}?` : null;
      }).filter(Boolean))].slice(0, 3) as string[]
    : [];

  const allSuggestions = [...contextualSuggestions, ...suggestedQuestions.filter(q => !contextualSuggestions.includes(q))].slice(0, 6);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('legal-assistant', {
        body: {
          type: 'chat',
          data: {
            user_input: messageText,
            conversation_history: messages.map(m => ({ role: m.role, content: m.content })),
            detected_issues: issues.map(i => ({
              clause: i.clause,
              risk_level: i.risk_level,
              law_cited: i.law_cited,
              explanation: i.eli5
            }))
          }
        }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      const assistantMessage: Message = { role: 'assistant', content: data.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestionClick = (question: string) => {
    sendMessage(question);
  };

  return (
    <div className="legal-card animate-slide-up stagger-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg gradient-accent flex items-center justify-center">
          <Scale className="w-5 h-5 text-accent-foreground" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">
            Legal Assistant
          </h2>
          <p className="text-sm text-muted-foreground">
            Ask about Indian Contract Act sections
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-accent animate-pulse" />
          <span className="text-xs text-accent font-medium">AI Powered</span>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="h-64 overflow-y-auto rounded-lg bg-muted/30 border border-border p-3 mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Ask me anything about the Indian Contract Act, 1872
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-sm">
              {allSuggestions.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(q)}
                  className="px-3 py-1.5 rounded-full text-xs bg-card border border-border hover:border-accent hover:bg-accent/5 text-muted-foreground transition-all duration-200"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-sm'
                      : 'bg-card border border-border text-foreground rounded-bl-sm'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none text-foreground [&>*:first-child]:mt-0 [&>*:last-child]:mb-0">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <p className="text-sm">{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-accent" />
                    <span className="text-sm text-muted-foreground">Researching...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Suggestion Pills */}
      {messages.length > 0 && messages.length < 6 && (
        <div className="mb-3 overflow-x-auto pb-1 scrollbar-hide">
          <div className="flex gap-2">
            {allSuggestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(q)}
                disabled={isLoading}
                className="px-3 py-1 rounded-full text-xs bg-muted hover:bg-muted/80 text-muted-foreground transition-colors whitespace-nowrap flex-shrink-0 disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <div className="relative flex-1">
          <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about any section..."
            disabled={isLoading}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50 transition-all duration-200"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>

      {/* Footer Info */}
      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
        <Scale className="w-3.5 h-3.5" />
        <span>Based on Indian Contract Act, 1872 • Does not constitute legal advice</span>
      </div>
    </div>
  );
};

export default InlineLegalChat;
