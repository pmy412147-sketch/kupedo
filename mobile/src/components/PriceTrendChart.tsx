import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { supabase } from '../lib/supabase';

interface PriceTrendChartProps {
  category: string;
  searchQuery?: string;
}

export function PriceTrendChart({ category, searchQuery }: PriceTrendChartProps) {
  const [loading, setLoading] = useState(true);
  const [priceData, setPriceData] = useState<{
    labels: string[];
    datasets: { data: number[] }[];
  } | null>(null);
  const [averagePrice, setAveragePrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  useEffect(() => {
    loadPriceTrend();
  }, [category, searchQuery]);

  const loadPriceTrend = async () => {
    setLoading(true);

    try {
      // Get ads from last 6 months
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      let query = supabase
        .from('ads')
        .select('price, created_at')
        .eq('category', category)
        .eq('status', 'active')
        .gte('created_at', sixMonthsAgo.toISOString())
        .order('created_at', { ascending: true });

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      const { data, error } = await query;

      if (error) throw error;

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Group by month
      const monthlyData: { [key: string]: number[] } = {};

      data.forEach((ad) => {
        const date = new Date(ad.created_at);
        const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = [];
        }
        monthlyData[monthKey].push(ad.price);
      });

      // Calculate average per month
      const labels: string[] = [];
      const values: number[] = [];

      Object.keys(monthlyData)
        .slice(-6)
        .forEach((monthKey) => {
          const prices = monthlyData[monthKey];
          const avg = prices.reduce((a, b) => a + b, 0) / prices.length;

          labels.push(monthKey.split('/')[0]);
          values.push(Math.round(avg));
        });

      setPriceData({
        labels,
        datasets: [{ data: values }],
      });

      // Calculate average and change
      const allPrices = data.map((ad) => ad.price);
      const avg = allPrices.reduce((a, b) => a + b, 0) / allPrices.length;
      setAveragePrice(Math.round(avg));

      if (values.length >= 2) {
        const oldPrice = values[0];
        const newPrice = values[values.length - 1];
        const change = ((newPrice - oldPrice) / oldPrice) * 100;
        setPriceChange(Math.round(change));
      }
    } catch (error) {
      console.error('Error loading price trend:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#10b981" />
        <Text style={styles.loadingText}>Načítavam cenový trend...</Text>
      </View>
    );
  }

  if (!priceData || priceData.datasets[0].data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bar-chart-outline" size={32} color="#9ca3af" />
        <Text style={styles.emptyText}>
          Nedostatok dát pre zobrazenie cenového trendu
        </Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="trending-up" size={20} color="#10b981" />
        </View>
        <Text style={styles.headerTitle}>Cenový trend</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Priemerná cena</Text>
          <Text style={styles.statValue}>{averagePrice} €</Text>
        </View>

        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Zmena za 6 mesiacov</Text>
          <View style={styles.changeContainer}>
            <Ionicons
              name={priceChange >= 0 ? 'arrow-up' : 'arrow-down'}
              size={16}
              color={priceChange >= 0 ? '#ef4444' : '#10b981'}
            />
            <Text
              style={[
                styles.changeValue,
                priceChange >= 0 ? styles.changeUp : styles.changeDown,
              ]}
            >
              {Math.abs(priceChange)}%
            </Text>
          </View>
        </View>
      </View>

      <LineChart
        data={priceData}
        width={screenWidth - 32}
        height={220}
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(16, 185, 129, ${opacity})`,
          labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '6',
            strokeWidth: '2',
            stroke: '#10b981',
          },
        }}
        bezier
        style={styles.chart}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLabels={true}
        withHorizontalLabels={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        fromZero
      />

      <Text style={styles.footnote}>
        * Údaje sú založené na aktívnych inzerátoch za posledných 6 mesiacov
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#d1fae5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  changeUp: {
    color: '#ef4444',
  },
  changeDown: {
    color: '#10b981',
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  footnote: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
    marginTop: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 12,
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
});
