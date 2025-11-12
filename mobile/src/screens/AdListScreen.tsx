import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { supabase } from '../lib/supabase';

export default function AdListScreen({ navigation, route }: any) {
  const [ads, setAds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const category = route.params?.category;

  useEffect(() => {
    loadAds();
  }, [category, searchQuery]);

  const loadAds = async () => {
    setLoading(true);
    let query = supabase
      .from('advertisements')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (searchQuery) {
      query = query.ilike('title', `%${searchQuery}%`);
    }

    const { data } = await query;
    if (data) setAds(data);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Hľadať inzeráty..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.adCard}
            onPress={() => navigation.navigate('AdDetail', { id: item.id })}
          >
            <Text style={styles.adTitle}>{item.title}</Text>
            <Text style={styles.adPrice}>{item.price} €</Text>
            <Text style={styles.adLocation}>{item.location}</Text>
            <Text style={styles.adCategory}>{item.category}</Text>
          </TouchableOpacity>
        )}
        refreshing={loading}
        onRefresh={loadAds}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    margin: 15,
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adCard: {
    backgroundColor: '#fff',
    margin: 15,
    marginTop: 0,
    padding: 15,
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
    marginBottom: 3,
  },
  adCategory: {
    fontSize: 12,
    color: '#999',
    textTransform: 'capitalize',
  },
});
