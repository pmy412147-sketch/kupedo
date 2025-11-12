'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { MessageSquare } from 'lucide-react';

interface Conversation {
  userId: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/');
      return;
    }

    const fetchConversations = async () => {
      try {
        const { data: userConversations, error: convError } = await supabase
          .from('conversations')
          .select('*')
          .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
          .order('last_message_at', { ascending: false });

        if (convError) {
          console.error('Error fetching conversations:', convError);
          return;
        }

        if (!userConversations || userConversations.length === 0) {
          setConversations([]);
          return;
        }

        const conversationIds = userConversations.map(c => c.id);
        const { data: messages, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .in('conversation_id', conversationIds)
          .order('created_at', { ascending: false });

        if (msgError) {
          console.error('Error fetching messages:', msgError);
        }

        const conversationsMap = new Map<string, any>();
        const userIds = new Set<string>();

        for (const conv of userConversations) {
          const otherUserId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
          userIds.add(otherUserId);

          const convMessages = messages?.filter(m => m.conversation_id === conv.id) || [];
          const lastMsg = convMessages[0];
          const unreadCount = convMessages.filter(m => m.sender_id !== user.id && !m.is_read).length;

          conversationsMap.set(otherUserId, {
            userId: otherUserId,
            userName: 'Používateľ',
            userAvatar: undefined,
            lastMessage: lastMsg?.content || 'Žiadne správy',
            lastMessageTime: conv.last_message_at || conv.created_at,
            unread: unreadCount
          });
        }

        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, avatar_url')
          .in('id', Array.from(userIds));

        if (profiles) {
          profiles.forEach(profile => {
            const conv = conversationsMap.get(profile.id);
            if (conv) {
              conv.userName = profile.display_name || 'Používateľ';
              conv.userAvatar = profile.avatar_url;
            }
          });
        }

        const conversationsArray = Array.from(conversationsMap.values())
          .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

        setConversations(conversationsArray);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [user, router]);

  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#F8F9FA] dark:bg-gray-900 py-8 pb-24 md:pb-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-3xl font-bold mb-6">Správy</h1>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <Card className="p-12 text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">Zatiaľ nemáte žiadne konverzácie</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <Card
                  key={conv.userId}
                  className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => router.push(`/chat/${conv.userId}`)}
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={conv.userAvatar} />
                      <AvatarFallback>{conv.userName[0]}</AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-semibold">{conv.userName}</h3>
                        <span className="text-xs text-gray-500">
                          {new Date(conv.lastMessageTime).toLocaleTimeString('sk-SK', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                    </div>

                    {conv.unread > 0 && (
                      <div className="bg-[#2ECC71] text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                        {conv.unread}
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
