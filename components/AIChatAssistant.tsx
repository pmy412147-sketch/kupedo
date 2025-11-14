'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  Minimize2,
  Maximize2,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  searchResults?: any[];
  searchQuery?: string;
  shouldRedirect?: boolean;
}

interface AIChatAssistantProps {
  contextType?: 'general' | 'ad_help' | 'buying_guide' | 'support';
}

export function AIChatAssistant({ contextType = 'general' }: AIChatAssistantProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: getWelcomeMessage(contextType),
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen, contextType]);

  const getWelcomeMessage = (type: string): string => {
    const welcomes: Record<string, string> = {
      general: 'Ahoj! Som AI asistent Kupado.sk. Ako vám môžem pomôcť?',
      ad_help: 'Ahoj! Pomôžem vám vytvoriť perfektný inzerát. Čo predávate?',
      buying_guide: 'Ahoj! Pomôžem vám vybrať ten správny produkt. Čo hľadáte?',
      support: 'Ahoj! Som tu, aby som vyriešil váš problém. Aký máte dotaz?',
    };
    return welcomes[type] || welcomes.general;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: inputValue,
          conversationId,
          userId: user.id,
          contextType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        let errorText = 'Prepáčte, vyskytla sa chyba. Skúste to prosím znova.';

        if (response.status === 503 || data.error?.includes('preťažená')) {
          errorText = 'AI asistent je momentálne preťažený. Skúste to prosím o chvíľu.';
        } else if (data.error) {
          errorText = data.error;
        }

        throw new Error(errorText);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(data.timestamp),
        searchResults: data.searchResults || undefined,
        searchQuery: data.searchQuery || undefined,
        shouldRedirect: data.shouldRedirect || false,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setConversationId(data.conversationId);

      if (data.shouldRedirect && data.searchQuery) {
        setTimeout(() => {
          router.push(`/?search=${encodeURIComponent(data.searchQuery)}`);
          setIsOpen(false);
        }, 800);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: error.message || 'Prepáčte, vyskytla sa chyba. Skúste to prosím znova.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearConversation = () => {
    setMessages([
      {
        role: 'assistant',
        content: getWelcomeMessage(contextType),
        timestamp: new Date(),
      },
    ]);
    setConversationId(null);
  };

  if (!user) return null;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 md:bottom-6 md:right-6 rounded-full h-14 w-14 shadow-lg z-50"
        style={{ backgroundColor: '#10b981' }}
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:bottom-6 md:right-6 z-50 shadow-2xl transition-all duration-300 ${
        isMinimized ? 'w-[calc(100vw-1rem)] md:w-80 h-16' : 'w-[calc(100vw-1rem)] md:w-96 h-[500px] md:h-[600px]'
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 md:p-4 border-b bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-t-lg">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
            <div>
              <h3 className="font-semibold text-sm md:text-base">AI Asistent</h3>
              <Badge variant="secondary" className="text-[10px] md:text-xs px-1.5 py-0">
                Online
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="max-w-[80%] space-y-2">
                    <div
                      className={`rounded-lg p-3 ${
                        message.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {message.timestamp.toLocaleTimeString('sk-SK', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {message.shouldRedirect && message.searchQuery && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            router.push(`/?search=${encodeURIComponent(message.searchQuery!)}`);
                            setIsOpen(false);
                          }}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1.5 h-auto"
                        >
                          <ExternalLink className="h-3 w-3 mr-1.5" />
                          Zobraziť výsledky ({message.searchResults?.length || 0})
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2 mb-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearConversation}
                  className="text-xs"
                >
                  Nová konverzácia
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Napíšte správu..."
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !inputValue.trim()}
                  style={{ backgroundColor: '#10b981' }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
