import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  StatusBar,
  Linking,
  Share,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function AdDetailScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();
  const [ad, setAd] = useState<any>(null);
  const [seller, setSeller] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadAd();
    checkFavorite();
    incrementViewCount();
  }, [id]);

  const loadAd = async () => {
    try {
      const { data: adData, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (adData) {
        setAd(adData);
        loadSeller(adData.user_id);
      }
    } catch (error) {
      console.error('Error loading ad:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSeller = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) setSeller(data);
    } catch (error) {
      console.error('Error loading seller:', error);
    }
  };

  const checkFavorite = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('ad_id', id)
        .maybeSingle();

      setIsFavorite(!!data);
    } catch (error) {
      console.error('Error checking favorite:', error);
    }
  };

  const incrementViewCount = async () => {
    try {
      const { data: currentAd } = await supabase
        .from('ads')
        .select('view_count')
        .eq('id', id)
        .single();

      if (currentAd) {
        await supabase
          .from('ads')
          .update({ view_count: (currentAd.view_count || 0) + 1 })
          .eq('id', id);
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      Alert.alert('Prihlásenie', 'Musíte sa prihlásiť');
      return;
    }

    try {
      if (isFavorite) {
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('ad_id', id);
        setIsFavorite(false);
        Alert.alert('Úspech', 'Odstránené z obľúbených');
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, ad_id: id });
        setIsFavorite(true);
        Alert.alert('Úspech', 'Pridané do obľúbených');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Chyba', 'Nepodarilo sa pridať do obľúbených');
    }
  };

  const handleContact = () => {
    if (!user) {
      Alert.alert('Prihlásenie', 'Musíte sa prihlásiť');
      return;
    }
    navigation.navigate('Chat', { userId: ad.user_id, adId: id });
  };

  const handleCall = () => {
    if (ad?.phone) {
      Linking.openURL(`tel:${ad.phone}`);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Pozrite si tento inzerát: ${ad.title}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('sk-SK', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (loading || !ad) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Načítavam...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <ScrollView showsVerticalScrollIndicator={false}>
        {ad.images && ad.images.length > 0 ? (
          <View style={styles.imageContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x;
                setSelectedImage(Math.round(x / width));
              }}
              scrollEventThrottle={16}
            >
              {ad.images.map((image: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>

            {ad.images.length > 1 && (
              <View style={styles.imageIndicator}>
                <Text style={styles.imageIndicatorText}>
                  {selectedImage + 1} / {ad.images.length}
                </Text>
              </View>
            )}

            {ad.is_boosted && (
              <View style={styles.boostedBadge}>
                <Text style={styles.boostedText}>⭐ TOP inzerát</Text>
              </View>
            )}
          </View>
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>📷</Text>
          </View>
        )}

        <View style={styles.content}>
          {/* Title */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{ad.title}</Text>
          </View>

          {/* Price and Action Buttons Card */}
          <View style={styles.priceCard}>
            <Text style={styles.price}>{formatPrice(ad.price)}</Text>

            {user && user.id !== ad.user_id && (
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.mainActionButton} onPress={handleContact}>
                  <Text style={styles.mainActionButtonText}>💬 Kontaktovať predajcu</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.favoriteActionButton} onPress={toggleFavorite}>
                  <Text style={styles.favoriteActionButtonText}>
                    {isFavorite ? '❤️ Pridať do obľúbených' : '🤍 Pridať do obľúbených'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reportButton}
                  onPress={() => Alert.alert('Nahlásiť inzerát', 'Funkcia bude dostupná čoskoro')}
                >
                  <Text style={styles.reportButtonText}>🚩 Nahlásiť inzerát</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Meta info */}
          <View style={styles.metaSection}>
            <Text style={styles.metaText}>📍 {ad.location}</Text>
            <Text style={styles.metaText}>📅 {formatDate(ad.created_at)}</Text>
            {ad.view_count > 0 && (
              <Text style={styles.metaText}>👁️ {ad.view_count} zobrazení</Text>
            )}
          </View>

          {/* Description */}
          {ad.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popis</Text>
              <Text style={styles.description}>{ad.description}</Text>
            </View>
          )}

          {/* Specs */}
          {ad.specs && Object.keys(ad.specs).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Špecifikácie</Text>
              <View style={styles.specs}>
                {ad.specs.brand && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Značka:</Text>
                    <Text style={styles.specValue}>{ad.specs.brand}</Text>
                  </View>
                )}
                {ad.specs.model && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Model:</Text>
                    <Text style={styles.specValue}>{ad.specs.model}</Text>
                  </View>
                )}
                {ad.specs.year && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Rok:</Text>
                    <Text style={styles.specValue}>{ad.specs.year}</Text>
                  </View>
                )}
                {ad.specs.mileage && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Najazdené km:</Text>
                    <Text style={styles.specValue}>{ad.specs.mileage.toLocaleString('sk-SK')}</Text>
                  </View>
                )}
                {ad.specs.fuel && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Palivo:</Text>
                    <Text style={styles.specValue}>{ad.specs.fuel}</Text>
                  </View>
                )}
                {ad.specs.transmission && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Prevodovka:</Text>
                    <Text style={styles.specValue}>{ad.specs.transmission}</Text>
                  </View>
                )}
                {ad.specs.condition && (
                  <View style={styles.specRow}>
                    <Text style={styles.specLabel}>Stav:</Text>
                    <Text style={styles.specValue}>{ad.specs.condition}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Seller Card */}
          {seller && (
            <View style={styles.sellerSection}>
              <Text style={styles.sectionTitle}>Predajca</Text>
              <View style={styles.sellerCard}>
                {seller.avatar_url ? (
                  <Image
                    source={{ uri: seller.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>
                      {seller.display_name?.charAt(0).toUpperCase() || 'P'}
                    </Text>
                  </View>
                )}
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{seller.display_name || 'Používateľ'}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={() => navigation.navigate('ViewProfile', { profileId: ad.user_id })}
              >
                <Text style={styles.viewProfileButtonText}>👤 Zobraziť profil</Text>
              </TouchableOpacity>

              {user && user.id !== ad.user_id && (
                <TouchableOpacity
                  style={styles.reviewButton}
                  onPress={() => Alert.alert('Pridať recenziu', 'Funkcia bude dostupná čoskoro')}
                >
                  <Text style={styles.reviewButtonText}>⭐ Pridať recenziu</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: width,
    height: width * 0.75,
    backgroundColor: colors.gray[100],
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 64,
    opacity: 0.3,
  },
  imageIndicator: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.lg,
  },
  imageIndicatorText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  boostedBadge: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    backgroundColor: colors.emerald[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  boostedText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    backgroundColor: colors.white,
  },
  titleSection: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  priceCard: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  price: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
    marginBottom: spacing.md,
  },
  actionButtons: {
    gap: spacing.sm,
  },
  mainActionButton: {
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
  },
  mainActionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  favoriteActionButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  favoriteActionButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  reportButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  reportButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#ef4444',
  },
  metaSection: {
    padding: spacing.md,
    gap: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  metaText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  section: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    lineHeight: 24,
  },
  specs: {
    gap: spacing.sm,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  specLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  specValue: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  sellerSection: {
    padding: spacing.md,
    backgroundColor: colors.white,
  },
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.emerald[100],
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[700],
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  viewProfileButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  viewProfileButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  reviewButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#FFA500',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  reviewButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFA500',
  },
});
