import React, { useEffect, useState, useRef } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function ChatScreen({ route }: any) {
  const { conversationId: paramConversationId, userId, adId } = route.params;
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(paramConversationId || null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (paramConversationId) {
      setConversationId(paramConversationId);
      setLoading(false);
    } else if (userId && adId) {
      findOrCreateConversation();
    }
  }, [paramConversationId, userId, adId]);

  useEffect(() => {
    if (conversationId && !loading) {
      loadMessages();
      subscribeToMessages();
    }
  }, [conversationId, loading]);

  const findOrCreateConversation = async () => {
    try {
      const { data: existing, error: findError } = await supabase
        .from('conversations')
        .select('id')
        .eq('ad_id', adId)
        .or(`and(participant_1.eq.${user?.id},participant_2.eq.${userId}),and(participant_1.eq.${userId},participant_2.eq.${user?.id})`)
        .maybeSingle();

      if (findError) throw findError;

      if (existing) {
        setConversationId(existing.id);
      } else {
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            ad_id: adId,
            participant_1: user?.id,
            participant_2: userId,
            last_message_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (createError) throw createError;
        setConversationId(newConv.id);
      }
    } catch (error: any) {
      console.error('Error finding/creating conversation:', error);
      Alert.alert('Chyba', 'Nepodarilo sa vytvoriť konverzáciu');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*, sender:profiles!sender_id(*)')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) setMessages(data);
  };

  const subscribeToMessages = () => {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) {
      Alert.alert('Chyba', 'Správa nemôže byť prázdna');
      return;
    }

    if (!conversationId) {
      Alert.alert('Chyba', 'Konverzácia ešte nie je pripravená');
      return;
    }

    try {
      const { data, error } = await supabase.from('messages').insert({
        conversation_id: conversationId,
        sender_id: user?.id,
        content: newMessage.trim(),
      }).select();

      if (error) {
        console.error('Error sending message:', error);
        Alert.alert('Chyba', `Nepodarilo sa odoslať správu: ${error.message}`);
        return;
      }

      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', conversationId);

      setNewMessage('');
      flatListRef.current?.scrollToEnd();
    } catch (err: any) {
      console.error('Unexpected error:', err);
      Alert.alert('Chyba', `Neočakávaná chyba: ${err?.message || 'Neznáma chyba'}`);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top', 'left', 'right']}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Pripravujem konverzáciu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMe = item.sender_id === user?.id;
          return (
            <View
              style={[
                styles.messageContainer,
                isMe ? styles.myMessage : styles.theirMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.content}</Text>
              <Text style={styles.messageTime}>
                {new Date(item.created_at).toLocaleTimeString('sk-SK', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          );
        }}
        contentContainerStyle={styles.messagesList}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Napíšte správu..."
          multiline
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  messagesList: {
    padding: 15,
  },
  messageContainer: {
    maxWidth: '75%',
    marginBottom: 10,
    padding: 12,
    borderRadius: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
  },
  messageText: {
    fontSize: 16,
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
