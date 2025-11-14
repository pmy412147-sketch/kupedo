import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

interface DashboardStats {
  totalAds: number;
  activeAds: number;
  totalViews: number;
  totalInteractions: number;
  totalFavorites: number;
  totalMessages: number;
  avgPrice: number;
  viewsToday: number;
  viewsThisWeek: number;
  conversionRate: number;
}

interface AdPerformance {
  id: string;
  title: string;
  views: number;
  interactions: number;
  favorites: number;
  messages: number;
  price: number;
  created_at: string;
}

type TimeRange = '7d' | '30d' | 'all';

export default function DashboardScreen({ navigation }: any) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topAds, setTopAds] = useState<AdPerformance[]>([]);
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [coinBalance, setCoinBalance] = useState(0);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadCoinBalance();
    }
  }, [user, timeRange]);

  const loadCoinBalance = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_coins')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setCoinBalance(data.balance);
      }
    } catch (error) {
      console.error('Error loading coin balance:', error);
    }
  };

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const now = new Date();
      const startDate = timeRange === '7d'
        ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        : timeRange === '30d'
        ? new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        : new Date(0);

      const { data: ads } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user.id);

      if (!ads) return;

      const adIds = ads.map(ad => ad.id);

      const { data: views } = await supabase
        .from('listing_views')
        .select('*')
        .in('ad_id', adIds)
        .gte('viewed_at', startDate.toISOString());

      const { data: interactions } = await supabase
        .from('listing_interactions')
        .select('*')
        .in('ad_id', adIds)
        .gte('created_at', startDate.toISOString());

      const totalAds = ads.length;
      const activeAds = ads.filter(ad => ad.status === 'active').length;
      const totalViews = views?.length || 0;
      const totalInteractions = interactions?.length || 0;
      const totalFavorites = ads.reduce((sum, ad) => sum + (ad.favorite_count || 0), 0);
      const totalMessages = ads.reduce((sum, ad) => sum + (ad.message_count || 0), 0);
      const avgPrice = totalAds > 0 ? ads.reduce((sum, ad) => sum + (ad.price || 0), 0) / totalAds : 0;

      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const viewsToday = views?.filter(v => new Date(v.viewed_at) >= todayStart).length || 0;

      const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const viewsThisWeek = views?.filter(v => new Date(v.viewed_at) >= weekStart).length || 0;

      const conversionRate = totalViews > 0 ? (totalInteractions / totalViews) * 100 : 0;

      setStats({
        totalAds,
        activeAds,
        totalViews,
        totalInteractions,
        totalFavorites,
        totalMessages,
        avgPrice,
        viewsToday,
        viewsThisWeek,
        conversionRate
      });

      const adPerformance: AdPerformance[] = ads.map(ad => {
        const adViews = views?.filter(v => v.ad_id === ad.id).length || 0;
        const adInteractions = interactions?.filter(i => i.ad_id === ad.id).length || 0;

        return {
          id: ad.id,
          title: ad.title,
          views: adViews,
          interactions: adInteractions,
          favorites: ad.favorite_count || 0,
          messages: ad.message_count || 0,
          price: ad.price || 0,
          created_at: ad.created_at
        };
      });

      adPerformance.sort((a, b) => b.views - a.views);
      setTopAds(adPerformance.slice(0, 5));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
    loadCoinBalance();
  };

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyText}>Prihláste sa pre zobrazenie dashboardu</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dashboard</Text>
          <Text style={styles.headerSubtitle}>Sledujte výkonnosť vašich inzerátov</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Text style={styles.refreshIcon}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.timeRangeContainer}>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === '7d' && styles.timeRangeButtonActive]}
            onPress={() => setTimeRange('7d')}
          >
            <Text style={[styles.timeRangeText, timeRange === '7d' && styles.timeRangeTextActive]}>
              7 dní
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === '30d' && styles.timeRangeButtonActive]}
            onPress={() => setTimeRange('30d')}
          >
            <Text style={[styles.timeRangeText, timeRange === '30d' && styles.timeRangeTextActive]}>
              30 dní
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.timeRangeButton, timeRange === 'all' && styles.timeRangeButtonActive]}
            onPress={() => setTimeRange('all')}
          >
            <Text style={[styles.timeRangeText, timeRange === 'all' && styles.timeRangeTextActive]}>
              Všetko
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.coinCard}
          onPress={() => navigation.navigate('Coins')}
        >
          <View style={styles.coinHeader}>
            <View style={styles.coinHeaderLeft}>
              <Text style={styles.coinIcon}>🪙</Text>
              <View>
                <Text style={styles.coinTitle}>Moje mince</Text>
                <Text style={styles.coinSubtitle}>Použite mince na topovanie vašich inzerátov</Text>
              </View>
            </View>
          </View>
          <View style={styles.coinContent}>
            <View>
              <Text style={styles.coinBalance}>{coinBalance}</Text>
              <Text style={styles.coinLabel}>Dostupných mincí</Text>
            </View>
            <TouchableOpacity
              style={styles.buyButton}
              onPress={() => navigation.navigate('Coins')}
            >
              <Text style={styles.buyButtonText}>🛒 Kúpiť</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>👁️</Text>
              <Text style={styles.statLabel}>Zobrazenia</Text>
            </View>
            <Text style={styles.statValue}>{stats?.totalViews.toLocaleString() || 0}</Text>
            <Text style={styles.statSubtext}>+{stats?.viewsToday || 0} dnes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>💬</Text>
              <Text style={styles.statLabel}>Interakcie</Text>
            </View>
            <Text style={styles.statValue}>{stats?.totalInteractions || 0}</Text>
            <Text style={styles.statSubtext}>{stats?.conversionRate.toFixed(1) || 0}% konverzia</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>❤️</Text>
              <Text style={styles.statLabel}>Obľúbené</Text>
            </View>
            <Text style={styles.statValue}>{stats?.totalFavorites || 0}</Text>
            <Text style={styles.statSubtext}>{stats?.totalAds || 0} inzerátov</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statLabel}>Priem. cena</Text>
            </View>
            <Text style={styles.statValue}>€{stats?.avgPrice.toFixed(0) || 0}</Text>
            <Text style={styles.statSubtext}>{stats?.activeAds || 0} aktívnych</Text>
          </View>
        </View>

        <View style={styles.topAdsSection}>
          <Text style={styles.sectionTitle}>Top inzeráty</Text>
          <Text style={styles.sectionSubtitle}>Vaše najúspešnejšie inzeráty za vybrané obdobie</Text>

          {topAds.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>📦</Text>
              <Text style={styles.emptyStateText}>Zatiaľ nemáte žiadne inzeráty</Text>
            </View>
          ) : (
            topAds.map((ad, index) => (
              <TouchableOpacity
                key={ad.id}
                style={styles.topAdCard}
                onPress={() => navigation.navigate('AdDetail', { id: ad.id })}
              >
                <View style={styles.topAdLeft}>
                  <Text style={styles.topAdRank}>#{index + 1}</Text>
                  <View style={styles.topAdInfo}>
                    <Text style={styles.topAdTitle} numberOfLines={1}>
                      {ad.title}
                    </Text>
                    <View style={styles.topAdStats}>
                      <Text style={styles.topAdStat}>👁️ {ad.views}</Text>
                      <Text style={styles.topAdStat}>💬 {ad.interactions}</Text>
                      <Text style={styles.topAdStat}>❤️ {ad.favorites}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.topAdRight}>
                  <Text style={styles.topAdPrice}>€{ad.price}</Text>
                  <Text style={styles.topAdConversion}>
                    {ad.views > 0 ? ((ad.interactions / ad.views) * 100).toFixed(1) : 0}% konverzia
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl + spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.default,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshIcon: {
    fontSize: typography.fontSize.xl,
  },
  timeRangeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  timeRangeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
  },
  timeRangeButtonActive: {
    backgroundColor: colors.emerald[500],
    borderColor: colors.emerald[500],
  },
  timeRangeText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  timeRangeTextActive: {
    color: colors.white,
  },
  coinCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.emerald[50],
    borderRadius: borderRadius.xl,
    borderWidth: 2,
    borderColor: colors.emerald[200],
  },
  coinHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  coinHeaderLeft: {
    flexDirection: 'row',
    gap: spacing.sm,
    flex: 1,
  },
  coinIcon: {
    fontSize: typography.fontSize['2xl'],
  },
  coinTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  coinSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
  },
  coinContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  coinBalance: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[700],
  },
  coinLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs / 2,
  },
  buyButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.lg,
  },
  buyButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: (width - spacing.md * 3) / 2,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  statIcon: {
    fontSize: typography.fontSize.lg,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  statSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  topAdsSection: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  emptyState: {
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  topAdCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border.default,
    marginBottom: spacing.sm,
  },
  topAdLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  topAdRank: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.gray[400],
  },
  topAdInfo: {
    flex: 1,
  },
  topAdTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  topAdStats: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  topAdStat: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  topAdRight: {
    alignItems: 'flex-end',
  },
  topAdPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs / 2,
  },
  topAdConversion: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
