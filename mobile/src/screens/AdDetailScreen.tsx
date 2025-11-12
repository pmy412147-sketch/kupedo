import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AdDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();
  const [ad, setAd] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    loadAd();
    checkFavorite();
  }, [id]);

  const loadAd = async () => {
    const { data } = await supabase
      .from('advertisements')
      .select('*, profiles(*)')
      .eq('id', id)
      .single();

    if (data) setAd(data);
  };

  const checkFavorite = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('ad_id', id)
      .single();

    setIsFavorite(!!data);
  };

  const toggleFavorite = async () => {
    if (!user) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('ad_id', id);
      setIsFavorite(false);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, ad_id: id });
      setIsFavorite(true);
    }
  };

  const handleContact = async () => {
    if (!user || !ad) return;

    const { data: existingConversation } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${ad.user_id}),and(user1_id.eq.${ad.user_id},user2_id.eq.${user.id})`)
      .single();

    if (existingConversation) {
      navigation.navigate('Chat', { conversationId: existingConversation.id });
    } else {
      const { data: newConversation } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: ad.user_id,
          ad_id: id,
        })
        .select()
        .single();

      if (newConversation) {
        navigation.navigate('Chat', { conversationId: newConversation.id });
      }
    }
  };

  if (!ad) {
    return (
      <View style={styles.container}>
        <Text>Načítavam...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{ad.title}</Text>
        <Text style={styles.price}>{ad.price} €</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Popis</Text>
        <Text style={styles.description}>{ad.description}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Lokalita</Text>
        <Text style={styles.text}>{ad.location}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Kategória</Text>
        <Text style={styles.text}>{ad.category}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Predávajúci</Text>
        <Text style={styles.text}>{ad.profiles?.full_name || 'Anonym'}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.favoriteButton]}
          onPress={toggleFavorite}
        >
          <Text style={styles.buttonText}>
            {isFavorite ? '❤️ Odstániť z obľúbených' : '🤍 Pridať do obľúbených'}
          </Text>
        </TouchableOpacity>

        {user?.id !== ad.user_id && (
          <TouchableOpacity style={styles.button} onPress={handleContact}>
            <Text style={styles.buttonText}>💬 Kontaktovať</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  label: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  text: {
    fontSize: 16,
  },
  actions: {
    padding: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  favoriteButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});
