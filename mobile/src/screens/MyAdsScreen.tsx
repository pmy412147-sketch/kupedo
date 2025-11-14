import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  created_at: string;
  status: string;
  images: string[];
  is_boosted: boolean;
  boosted_until: string | null;
}

export default function MyAdsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user) {
      loadMyAds();
    }
  }, [user]);

  const loadMyAds = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (data) setAds(data);
    } catch (error) {
      console.error('Error loading ads:', error);
      Alert.alert('Chyba', 'Nepodarilo sa načítať inzeráty');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMyAds();
  };

  const handleTopovat = (ad: Ad) => {
    navigation.navigate('BoostAd', { adId: ad.id });
  };

  const handleEdit = (ad: Ad) => {
    navigation.navigate('EditAd', { id: ad.id });
  };

  const handlePause = async (ad: Ad) => {
    const newStatus = ad.status === 'active' ? 'paused' : 'active';

    try {
      const { error } = await supabase
        .from('ads')
        .update({ status: newStatus })
        .eq('id', ad.id);

      if (error) throw error;

      Alert.alert(
        'Úspech',
        newStatus === 'active' ? 'Inzerát bol aktivovaný' : 'Inzerát bol pozastavený'
      );
      loadMyAds();
    } catch (error) {
      console.error('Error updating ad status:', error);
      Alert.alert('Chyba', 'Nepodarilo sa zmeniť stav inzerátu');
    }
  };

  const handleDelete = async (ad: Ad) => {
    Alert.alert(
      'Zmazať inzerát',
      'Naozaj chcete zmazať tento inzerát?',
      [
        { text: 'Zrušiť', style: 'cancel' },
        {
          text: 'Zmazať',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('ads')
                .delete()
                .eq('id', ad.id);

              if (error) throw error;

              Alert.alert('Úspech', 'Inzerát bol zmazaný');
              loadMyAds();
            } catch (error) {
              console.error('Error deleting ad:', error);
              Alert.alert('Chyba', 'Nepodarilo sa zmazať inzerát');
            }
          }
        }
      ]
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
  };

  const isBoosted = (ad: Ad) => {
    return ad.is_boosted && ad.boosted_until && new Date(ad.boosted_until) > new Date();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Moje inzeráty</Text>
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Načítavam...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moje inzeráty</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('CreateAd')}
        >
          <Text style={styles.addButtonText}>+ Pridať inzerát</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {ads.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Zatiaľ nemáte žiadne inzeráty</Text>
            <TouchableOpacity
              style={styles.createFirstButton}
              onPress={() => navigation.navigate('CreateAd')}
            >
              <Text style={styles.createFirstButtonText}>Vytvoriť prvý inzerát</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.adsList}>
            {ads.map((ad) => (
              <View key={ad.id} style={styles.adCard}>
                <View style={styles.adContent}>
                  <Image
                    source={ad.images[0] ? { uri: ad.images[0] } : require('../../assets/icon.png')}
                    style={styles.adImage}
                    resizeMode="cover"
                  />

                  <View style={styles.adInfo}>
                    <View style={styles.adTitleRow}>
                      <Text style={styles.adTitle} numberOfLines={1}>
                        {ad.title}
                      </Text>
                      {isBoosted(ad) && (
                        <View style={styles.topBadge}>
                          <Text style={styles.topBadgeText}>TOP</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.adPrice}>
                      {ad.price > 0 ? `${ad.price} €` : 'Dohodou'}
                    </Text>

                    <Text style={styles.adLocation}>
                      {ad.location} • {formatDate(ad.created_at)}
                    </Text>

                    <Text style={styles.adStatus}>
                      Stav: <Text style={ad.status === 'active' ? styles.statusActive : styles.statusPaused}>
                        {ad.status === 'active' ? 'Aktívny' : 'Pozastavený'}
                      </Text>
                    </Text>

                    {isBoosted(ad) && ad.boosted_until && (
                      <Text style={styles.boostedUntil}>
                        ⭐ Topované do: {formatDate(ad.boosted_until)}
                      </Text>
                    )}
                  </View>
                </View>

                <View style={styles.adActions}>
                  <TouchableOpacity
                    style={styles.actionButtonTopovat}
                    onPress={() => handleTopovat(ad)}
                  >
                    <Text style={styles.actionButtonTopovatText}>⭐ Topovať</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButtonEdit}
                    onPress={() => handleEdit(ad)}
                  >
                    <Text style={styles.actionButtonEditText}>✏️ Upraviť</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.adActions}>
                  <TouchableOpacity
                    style={styles.actionButtonPause}
                    onPress={() => handlePause(ad)}
                  >
                    <Text style={styles.actionButtonPauseText}>
                      {ad.status === 'active' ? '⏸️ Pauza' : '▶️ Aktivovať'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionButtonDelete}
                    onPress={() => handleDelete(ad)}
                  >
                    <Text style={styles.actionButtonDeleteText}>🗑 Zmazať</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  addButton: {
    backgroundColor: colors.emerald[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.xl * 2,
  },
  emptyText: {
    fontSize: typography.fontSize.lg,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  createFirstButton: {
    backgroundColor: colors.emerald[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.lg,
  },
  createFirstButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
  },
  adsList: {
    padding: spacing.md,
    gap: spacing.md,
  },
  adCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adContent: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  adImage: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.md,
    backgroundColor: colors.gray[200],
  },
  adInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  adTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  adTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    flex: 1,
  },
  topBadge: {
    backgroundColor: '#FF9500',
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  topBadgeText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  adPrice: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
    marginBottom: spacing.xs,
  },
  adLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  adStatus: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statusActive: {
    color: colors.emerald[600],
    fontWeight: typography.fontWeight.semibold,
  },
  statusPaused: {
    color: '#FF9500',
    fontWeight: typography.fontWeight.semibold,
  },
  boostedUntil: {
    fontSize: typography.fontSize.xs,
    color: '#FF9500',
    marginTop: spacing.xs,
  },
  adActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  actionButtonTopovat: {
    flex: 1,
    backgroundColor: '#FF9500',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonTopovatText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  actionButtonEdit: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonEditText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  actionButtonPause: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonPauseText: {
    color: colors.text.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  actionButtonDelete: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#ef4444',
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  actionButtonDeleteText: {
    color: '#ef4444',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
});
