import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { supabase } from '../lib/supabase';

const categories = [
  { id: 'elektronika', name: 'Elektronika', icon: '📱' },
  { id: 'auta', name: 'Autá', icon: '🚗' },
  { id: 'nehnutelnosti', name: 'Nehnuteľnosti', icon: '🏠' },
  { id: 'oblecenie', name: 'Oblečenie', icon: '👕' },
  { id: 'nabytok', name: 'Nábytok', icon: '🛋️' },
  { id: 'sport', name: 'Šport', icon: '⚽' },
];

export default function HomeScreen({ navigation }: any) {
  const [featuredAds, setFeaturedAds] = useState<any[]>([]);

  useEffect(() => {
    loadFeaturedAds();
  }, []);

  const loadFeaturedAds = async () => {
    const { data } = await supabase
      .from('advertisements')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setFeaturedAds(data);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Kupedo</Text>
        <Text style={styles.subtitle}>Nájdite čo hľadáte</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kategórie</Text>
        <View style={styles.categories}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={styles.categoryCard}
              onPress={() => navigation.navigate('Ads', { category: category.id })}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Najnovšie inzeráty</Text>
        {featuredAds.map((ad) => (
          <TouchableOpacity
            key={ad.id}
            style={styles.adCard}
            onPress={() => navigation.navigate('AdDetail', { id: ad.id })}
          >
            <Text style={styles.adTitle}>{ad.title}</Text>
            <Text style={styles.adPrice}>{ad.price} €</Text>
            <Text style={styles.adLocation}>{ad.location}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate('CreateAd')}
      >
        <Text style={styles.createButtonText}>+ Pridať inzerát</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#007AFF',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  adCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
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
  createButton: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
