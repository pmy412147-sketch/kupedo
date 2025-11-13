import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Dimensions,
  StatusBar,
  RefreshControl
} from 'react-native';
import { supabase } from '../lib/supabase';
import { categories } from '../constants/categories';
import { colors, spacing, borderRadius, typography } from '../theme/colors';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAds();
  }, []);

  const loadAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) setAds(data);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAds();
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigation.navigate('Ads', { search: searchQuery });
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[colors.emerald[400], colors.teal[500], colors.cyan[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.title}>Kúp. Predaj. Dohodni.</Text>
          <Text style={styles.subtitle}>
            Slovenský marketplace pre všetko čo potrebujete
          </Text>

          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="napr. iPhone 15, byt v Bratislave..."
              placeholderTextColor={colors.gray[400]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
            >
              <Text style={styles.searchButtonText}>🔍</Text>
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategórie</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => navigation.navigate('Ads', { category: category.id })}
              >
                <View style={styles.categoryIconContainer}>
                  <Text style={styles.categoryIcon}>{category.icon}</Text>
                </View>
                <Text style={styles.categoryName} numberOfLines={1}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Najnovšie inzeráty</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Ads')}>
              <Text style={styles.seeAllText}>Zobraziť všetky</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Načítavam...</Text>
            </View>
          ) : ads.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Žiadne inzeráty</Text>
            </View>
          ) : (
            <View style={styles.adsGrid}>
              {ads.map((ad) => (
                <TouchableOpacity
                  key={ad.id}
                  style={styles.adCard}
                  onPress={() => navigation.navigate('AdDetail', { id: ad.id })}
                >
                  {ad.images && ad.images.length > 0 ? (
                    <Image
                      source={{ uri: ad.images[0] }}
                      style={styles.adImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.adImage, styles.adImagePlaceholder]}>
                      <Text style={styles.placeholderText}>📷</Text>
                    </View>
                  )}

                  {ad.is_boosted && (
                    <View style={styles.boostedBadge}>
                      <Text style={styles.boostedText}>⭐ TOP</Text>
                    </View>
                  )}

                  <View style={styles.adInfo}>
                    <Text style={styles.adTitle} numberOfLines={2}>
                      {ad.title}
                    </Text>
                    <Text style={styles.adPrice}>{formatPrice(ad.price)}</Text>
                    <Text style={styles.adLocation} numberOfLines={1}>
                      📍 {ad.location}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statsSectionTitle}>Prečo si vybrať Kupado.sk?</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Aktívnych používateľov</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📦</Text>
              <Text style={styles.statNumber}>100K+</Text>
              <Text style={styles.statLabel}>Aktívnych inzerátov</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🛡️</Text>
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Bezpečné transakcie</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statNumber}>500+</Text>
              <Text style={styles.statLabel}>Denných transakcií</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('CreateAd')}
      >
        <Text style={styles.floatingButtonText}>+ Pridať inzerát</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    paddingTop: 50,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  headerContent: {
    gap: spacing.md,
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.white,
    opacity: 0.95,
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  searchButton: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.emerald[600],
    fontWeight: typography.fontWeight.semibold,
  },
  categoriesScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryCard: {
    width: 120,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginRight: spacing.sm,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.emerald[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  emptyContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  adsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  adCard: {
    width: (width - spacing.md * 2 - spacing.sm) / 2,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adImage: {
    width: '100%',
    height: 140,
    backgroundColor: colors.gray[100],
  },
  adImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    opacity: 0.3,
  },
  boostedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.emerald[500],
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  boostedText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
  },
  adInfo: {
    padding: spacing.sm,
  },
  adTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 4,
    height: 36,
  },
  adPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
    marginBottom: 4,
  },
  adLocation: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  statsSection: {
    marginTop: spacing.xl,
    marginHorizontal: spacing.md,
    backgroundColor: colors.emerald[50],
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
  },
  statsSectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: (width - spacing.md * 4 - spacing.lg * 2) / 2,
    alignItems: 'center',
    padding: spacing.md,
  },
  statIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statNumber: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  floatingButton: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
});
