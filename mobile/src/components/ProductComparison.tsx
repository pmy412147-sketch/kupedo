import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

interface Ad {
  id: string;
  title: string;
  price: number;
  images: string[];
  condition: string;
  location: string;
  created_at: string;
}

interface ProductComparisonProps {
  ads: Ad[];
  onClose?: () => void;
}

export function ProductComparison({ ads, onClose }: ProductComparisonProps) {
  const [aiComparison, setAiComparison] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ads.length >= 2) {
      generateComparison();
    }
  }, [ads]);

  const generateComparison = async () => {
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/compare-products`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            ads: ads.map((ad) => ({
              title: ad.title,
              price: ad.price,
              condition: ad.condition,
              location: ad.location,
            })),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Comparison failed');
      }

      const data = await response.json();
      setAiComparison(data.comparison || '');
    } catch (error) {
      console.error('Error generating comparison:', error);
      setAiComparison('Nepodarilo sa vygenerovať porovnanie. Skúste to prosím znova.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Porovnanie produktov</Text>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.productsGrid}>
            {ads.map((ad) => (
              <View key={ad.id} style={styles.productCard}>
                <Image
                  source={{ uri: ad.images[0] }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
                <Text style={styles.productTitle} numberOfLines={2}>
                  {ad.title}
                </Text>
                <Text style={styles.productPrice}>{ad.price.toFixed(2)} €</Text>
                <View style={styles.productDetails}>
                  <Text style={styles.productDetail}>
                    <Ionicons name="checkmark-circle" size={14} color="#10b981" />{' '}
                    {ad.condition}
                  </Text>
                  <Text style={styles.productDetail}>
                    <Ionicons name="location" size={14} color="#6b7280" /> {ad.location}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.comparisonSection}>
            <View style={styles.aiHeader}>
              <Ionicons name="sparkles" size={20} color="#10b981" />
              <Text style={styles.aiTitle}>AI Porovnanie</Text>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#10b981" />
                <Text style={styles.loadingText}>Generujem porovnanie...</Text>
              </View>
            ) : (
              <View style={styles.comparisonContent}>
                <Text style={styles.comparisonText}>{aiComparison}</Text>
              </View>
            )}
          </View>

          <View style={styles.comparisonTable}>
            <Text style={styles.tableTitle}>Prehľad parametrov</Text>

            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Cena</Text>
              {ads.map((ad) => (
                <Text key={ad.id} style={styles.tableValue}>
                  {ad.price.toFixed(2)} €
                </Text>
              ))}
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Stav</Text>
              {ads.map((ad) => (
                <Text key={ad.id} style={styles.tableValue}>
                  {ad.condition}
                </Text>
              ))}
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Lokalita</Text>
              {ads.map((ad) => (
                <Text key={ad.id} style={styles.tableValue}>
                  {ad.location}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  productsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  productCard: {
    flex: 1,
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  productDetails: {
    gap: 4,
  },
  productDetail: {
    fontSize: 12,
    color: '#6b7280',
  },
  comparisonSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  comparisonContent: {
    paddingVertical: 8,
  },
  comparisonText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  comparisonTable: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  tableTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tableValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    textAlign: 'center',
  },
});
