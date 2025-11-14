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
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface UserProfile {
  id: string;
  name: string;
  avatar_url?: string;
}

interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  ad_id?: string;
}

export default function ChatPage() {
  const { user } = useAuth();
  const params = useParams();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
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
        .maybeSingle();

      if (data) {
        setOtherUser({
          id: data.id,
          name: data.display_name || 'Používateľ',
          avatar_url: data.avatar_url
        });
      }
    };

    const findOrCreateConversation = async () => {
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('*')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${params.userId}),and(participant_1.eq.${params.userId},participant_2.eq.${user.id})`)
        .maybeSingle();

      if (existingConversation) {
        setConversation(existingConversation);
        return existingConversation;
      }

      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participant_1: user.id,
          participant_2: params.userId as string,
          ad_id: adId || null,
          created_at: new Date().toISOString(),
          last_message_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return null;
      }

      setConversation(newConversation);
      return newConversation;
    };

    const fetchMessages = async (conversationId: string) => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
      } else if (data) {
        setMessages(data);
        setTimeout(scrollToBottom, 100);
      }
    };

    const initialize = async () => {
      setLoading(true);
      await fetchOtherUser();
      const conv = await findOrCreateConversation();
      if (conv) {
        await fetchMessages(conv.id);

        channel = supabase
          .channel(`conversation:${conv.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `conversation_id=eq.${conv.id}`
            },
            (payload) => {
              setMessages(prev => [...prev, payload.new as Message]);
              setTimeout(scrollToBottom, 100);
            }
          )
          .subscribe();
      }
      setLoading(false);
    };

    initialize();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [user, params.userId, adId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !newMessage.trim() || !conversation) return;

    const messageContent = newMessage.trim();

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: messageContent,
          is_read: false,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error sending message:', error);
        return;
      }

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversation.id);

      setNewMessage('');

      sendPushNotification(messageContent);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const sendPushNotification = async (messageContent: string) => {
    try {
      const recipientId = conversation?.participant_1 === user?.id
        ? conversation?.participant_2
        : conversation?.participant_1;

      if (!recipientId) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/send-push-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          userId: recipientId,
          title: `Nová správa od ${otherUser?.name || user?.email || 'Používateľ'}`,
          body: messageContent.substring(0, 100),
          data: {
            type: 'message',
            conversationId: conversation?.id,
            senderId: user?.id,
          },
        }),
      });

      if (!response.ok) {
        console.log('Failed to send push notification:', await response.text());
      }
    } catch (error) {
      console.log('Failed to send push notification (not critical):', error);
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

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <p>Načítavam...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 pb-20 md:pb-0">
        <div className="container mx-auto px-4 py-4 md:py-8 max-w-4xl">
          <Card className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-200px)]">
            <div className="p-3 md:p-4 border-b flex items-center gap-3">
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarImage src={otherUser?.avatar_url} />
                <AvatarFallback>{otherUser?.name?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-semibold text-sm md:text-base">{otherUser?.name}</h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-3 md:space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Zatiaľ žiadne správy
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[70%] px-3 md:px-4 py-2 rounded-lg ${
                        message.sender_id === user.id
                          ? 'bg-[#2ECC71] text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}
                    >
                      <p className="text-sm md:text-base break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.sender_id === user.id ? 'text-white/70' : 'text-gray-500 dark:text-gray-400'
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

            <form onSubmit={handleSendMessage} className="p-3 md:p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Napíšte správu..."
                  className="flex-1 text-sm md:text-base"
                />
                <Button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="bg-[#2ECC71] hover:bg-[#27AE60] shrink-0"
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
