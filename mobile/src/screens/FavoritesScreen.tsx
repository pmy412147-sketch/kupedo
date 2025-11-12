import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function FavoritesScreen({ navigation }: any) {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    const { data } = await supabase
      .from('favorites')
      .select('*, ad:advertisements(*)')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false });

    if (data) setFavorites(data);
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.adCard}
            onPress={() => navigation.navigate('AdDetail', { id: item.ad.id })}
          >
            <Text style={styles.adTitle}>{item.ad.title}</Text>
            <Text style={styles.adPrice}>{item.ad.price} €</Text>
            <Text style={styles.adLocation}>{item.ad.location}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Žiadne obľúbené inzeráty</Text>
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
  adCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  adPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  adLocation: {
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
