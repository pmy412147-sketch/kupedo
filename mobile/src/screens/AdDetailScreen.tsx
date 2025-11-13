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

  const incrementViewCount = async () => {
    try {
      await supabase.rpc('increment_view_count', { ad_id: id });
    } catch (error) {
      console.error('Error incrementing view count:', error);
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

  const toggleFavorite = async () => {
    if (!user) {
      navigation.navigate('Login');
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
      } else {
        await supabase
          .from('favorites')
          .insert({ user_id: user.id, ad_id: id });
        setIsFavorite(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const handleContact = async () => {
    if (!user) {
      navigation.navigate('Login');
      return;
    }

    if (!ad) {
      Alert.alert('Chyba', 'Inzerát sa nenašiel');
      return;
    }

    if (ad.user_id === user.id) {
      Alert.alert('Info', 'Nemôžete kontaktovať svoj vlastný inzerát');
      return;
    }

    try {
      console.log('Looking for conversation between:', user.id, 'and', ad.user_id);

      const { data: existingConversation, error: searchError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_1.eq.${user.id},participant_2.eq.${ad.user_id}),and(participant_1.eq.${ad.user_id},participant_2.eq.${user.id})`)
        .maybeSingle();

      if (searchError) {
        console.error('Error searching conversation:', searchError);
        Alert.alert('Chyba', `Nepodarilo sa nájsť konverzáciu: ${searchError.message}`);
        return;
      }

      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation.id);
        navigation.navigate('Chat', { conversationId: existingConversation.id });
      } else {
        console.log('Creating new conversation');
        const { data: newConversation, error: createError } = await supabase
          .from('conversations')
          .insert({
            participant_1: user.id,
            participant_2: ad.user_id,
            ad_id: id,
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating conversation:', createError);
          Alert.alert('Chyba', `Nepodarilo sa vytvoriť konverzáciu: ${createError.message}`);
          return;
        }

        if (newConversation) {
          console.log('Created new conversation:', newConversation.id);
          navigation.navigate('Chat', { conversationId: newConversation.id });
        } else {
          Alert.alert('Chyba', 'Nepodarilo sa vytvoriť konverzáciu');
        }
      }
    } catch (error: any) {
      console.error('Error in handleContact:', error);
      Alert.alert('Chyba', `Neočakávaná chyba: ${error?.message || 'Neznáma chyba'}`);
    }
  };

  const handleCall = () => {
    if (ad?.phone) {
      Linking.openURL(`tel:${ad.phone}`);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${ad.title} - ${formatPrice(ad.price)}\n\nPozrite si tento inzerát na Kupado.sk`,
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
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>{ad.title}</Text>
              <TouchableOpacity onPress={toggleFavorite} style={styles.favoriteButton}>
                <Text style={styles.favoriteIcon}>{isFavorite ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.price}>{formatPrice(ad.price)}</Text>
            <View style={styles.meta}>
              <Text style={styles.metaText}>📍 {ad.location}</Text>
              <Text style={styles.metaText}>📅 {formatDate(ad.created_at)}</Text>
              {ad.view_count > 0 && (
                <Text style={styles.metaText}>👁️ {ad.view_count} zobrazení</Text>
              )}
            </View>
          </View>

          {ad.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Popis</Text>
              <Text style={styles.description}>{ad.description}</Text>
            </View>
          )}

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

          {seller && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Predávajúci</Text>
              <View style={styles.sellerCard}>
                {seller.avatar_url ? (
                  <Image
                    source={{ uri: seller.avatar_url }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={[styles.avatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>
                      {seller.name?.charAt(0).toUpperCase() || '?'}
                    </Text>
                  </View>
                )}
                <View style={styles.sellerInfo}>
                  <Text style={styles.sellerName}>{seller.name || 'Používateľ'}</Text>
                  <Text style={styles.sellerMeta}>
                    Člen od {new Date(seller.created_at).getFullYear()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Text style={styles.shareButtonText}>📤</Text>
        </TouchableOpacity>

        {ad.phone && (
          <TouchableOpacity style={styles.callButton} onPress={handleCall}>
            <Text style={styles.callButtonText}>📞 Zavolať</Text>
          </TouchableOpacity>
        )}

        {user?.id !== ad.user_id && (
          <TouchableOpacity style={styles.contactButton} onPress={handleContact}>
            <Text style={styles.contactButtonText}>💬 Napísať správu</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
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
    paddingBottom: spacing.xxl,
  },
  header: {
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginRight: spacing.sm,
  },
  favoriteButton: {
    padding: spacing.xs,
  },
  favoriteIcon: {
    fontSize: 28,
  },
  price: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
    marginBottom: spacing.sm,
  },
  meta: {
    gap: spacing.xs,
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
  sellerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: borderRadius.full,
    backgroundColor: colors.gray[200],
  },
  avatarPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
  },
  sellerInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: 2,
  },
  sellerMeta: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    gap: spacing.sm,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  shareButton: {
    width: 48,
    height: 48,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 20,
  },
  callButton: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  contactButton: {
    flex: 2,
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.sm + 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
