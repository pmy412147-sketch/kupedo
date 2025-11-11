'use client';

import { useEffect, useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useParams, useSearchParams } from 'next/navigation';
import { Send } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  ad_id?: string;
  content: string;
  read: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const adId = searchParams.get('ad');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!user) return;

    let channel: RealtimeChannel;

    const fetchOtherUser = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .eq('id', params.userId as string)
        .single();

      if (data) {
        setOtherUser({
          id: data.id,
          name: data.display_name || 'Používateľ',
          avatar_url: data.avatar_url
        });
      }
    };

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${params.userId}),and(sender_id.eq.${params.userId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });

      if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    };

    fetchOtherUser();
    fetchMessages();

    // Subscribe to real-time updates
    channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id},receiver_id=eq.${params.userId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          setTimeout(scrollToBottom, 100);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${params.userId},receiver_id=eq.${user.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, params.userId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newMessage.trim()) return;

    try {
      await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: params.userId as string,
          ad_id: adId || null,
          content: newMessage,
          read: false,
          created_at: new Date().toISOString()
        });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Musíte sa prihlásiť</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="flex flex-col h-[calc(100vh-200px)]">
            <div className="p-4 border-b flex items-center gap-3">
              <Avatar>
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback>{otherUser?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold">{otherUser?.name}</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Zatiaľ žiadne správy
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.uid ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] px-4 py-2 rounded-lg ${
                        message.sender_id === user.uid
                          ? 'bg-[#2ECC71] text-white'
                          : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    >
                      <p>{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user.uid ? 'text-white/70' : 'text-gray-500'
                      }`}>
                        {new Date(message.created_at).toLocaleTimeString('sk-SK', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Napíšte správu..."
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  style={{ backgroundColor: '#2ECC71' }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </>
  );
}
