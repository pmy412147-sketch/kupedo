import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function MessagesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    const { data, error } = await supabase
      .from('conversations')
      .select('*, participant1:profiles!participant_1(*), participant2:profiles!participant_2(*), ad:ads!ad_id(*)')
      .or(`participant_1.eq.${user?.id},participant_2.eq.${user?.id}`)
      .order('last_message_at', { ascending: false });

    if (error) {
      console.error('Error loading conversations:', error);
      return;
    }
    if (data) setConversations(data);
  };

  const getOtherUser = (conversation: any) => {
    return conversation.participant_1 === user?.id ? conversation.participant2 : conversation.participant1;
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const otherUser = getOtherUser(item);
          return (
            <TouchableOpacity
              style={styles.conversationCard}
              onPress={() => navigation.navigate('Chat', { conversationId: item.id })}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {otherUser?.full_name?.[0] || '?'}
                </Text>
              </View>
              <View style={styles.conversationInfo}>
                <Text style={styles.userName}>
                  {otherUser?.full_name || 'Používateľ'}
                </Text>
                <Text style={styles.adTitle} numberOfLines={1}>
                  {item.ad?.title}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Žiadne správy</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  conversationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  conversationInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  adTitle: {
    fontSize: 14,
    color: '#666',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});
