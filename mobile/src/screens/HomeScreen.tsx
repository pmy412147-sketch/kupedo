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
import { useAuth } from '../contexts/AuthContext';
import { categories } from '../constants/categories';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [ads, setAds] = useState<any[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAds();
    if (user) loadUserCoins();
  }, [user]);

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

  const loadUserCoins = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_coins')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      if (data) setUserCoins(data.balance || 0);
    } catch (error) {
      console.error('Error loading user coins:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAds();
    if (user) loadUserCoins();
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
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* Header s logom a mincami */}
      <View style={styles.topHeader}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoIcon}
            resizeMode="contain"
          />
          <Text style={styles.logo}>Kupedo</Text>
        </View>
        {user && (
          <TouchableOpacity
            style={styles.coinsButton}
            onPress={() => navigation.navigate('Coins')}
          >
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.coinCount}>{userCoins}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Search bar */}
        <View style={styles.searchSection}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Čo hľadáte?"
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

        {/* Kategórie */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kategórie</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesCarousel}
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

        {/* Najnovšie inzeráty */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Najnovšie inzeráty</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Ads')}>
              <Text style={styles.seeAllText}>Všetky →</Text>
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

        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: 50,
    paddingBottom: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  logoIcon: {
    width: 32,
    height: 32,
  },
  logo: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
  },
  coinsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald[50],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  coinIcon: {
    fontSize: 18,
  },
  coinCount: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[700],
  },
  content: {
    flex: 1,
  },
  searchSection: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  section: {
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  seeAllText: {
    fontSize: typography.fontSize.sm,
    color: colors.emerald[600],
    fontWeight: typography.fontWeight.semibold,
  },
  categoriesCarousel: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  categoryCard: {
    width: 90,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.emerald[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  categoryIcon: {
    fontSize: 24,
  },
  categoryName: {
    fontSize: typography.fontSize.xs - 1,
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
    paddingHorizontal: spacing.xs,
  },
  adCard: {
    width: (width - spacing.md * 2) / 2,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border.light,
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
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
    marginBottom: 4,
  },
  adLocation: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
});
