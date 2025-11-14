import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface Ad {
  id: string;
  title: string;
  price: number;
  location: string;
  images: string[];
  created_at: string;
  view_count: number;
}

export default function ProfileScreen({ navigation, route }: any) {
  const { user } = useAuth();
  const profileId = route?.params?.profileId || user?.id;
  const isOwnProfile = user?.id === profileId;

  const [profile, setProfile] = useState<any>(null);
  const [userAds, setUserAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [coinBalance, setCoinBalance] = useState(0);
  const [activeTab, setActiveTab] = useState<'ads' | 'reviews'>('ads');

  useEffect(() => {
    if (profileId) {
      fetchProfileData();
      if (isOwnProfile) {
        fetchCoinBalance();
      }
    }
  }, [profileId]);

  const fetchCoinBalance = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('user_coins')
      .select('balance')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data) {
      setCoinBalance(data.balance);
    }
  };

  const fetchProfileData = async () => {
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (profileData) {
        setProfile(profileData);
      }

      const { data: adsData } = await supabase
        .from('ads')
        .select('*')
        .eq('user_id', profileId)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(12);

      setUserAds(adsData || []);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatMemberSince = (date: string) => {
    const diffInDays = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24));
    if (diffInDays < 30) return `pred ${diffInDays} dňami`;
    if (diffInDays < 365) return `pred ${Math.floor(diffInDays / 30)} mesiacmi`;
    return `pred ${Math.floor(diffInDays / 365)} rokmi`;
  };

  const handleChangeAvatar = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Chyba', 'Potrebujeme povolenie na prístup k fotkám');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        await uploadAvatar(image.uri);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Chyba', 'Nepodarilo sa vybrať obrázok');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user?.id}/${Date.now()}.${fileExt}`;

      console.log('Uploading avatar:', fileName, 'Size:', arrayBuffer.byteLength);

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, arrayBuffer, {
          contentType: `image/${fileExt}`,
          cacheControl: '3600',
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const avatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      Alert.alert('Úspech', 'Profilová fotka bola zmenená');
      fetchProfileData();
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Chyba', error.message || 'Nepodarilo sa nahrať fotku');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.emerald[500]} />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Profil nenájdený</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          {/* Avatar */}
          <View style={styles.avatarContainer}>
            {profile.avatar_url ? (
              <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {profile.display_name?.[0] || 'U'}
                </Text>
              </View>
            )}
            {isOwnProfile && (
              <TouchableOpacity
                style={styles.changeAvatarButton}
                onPress={handleChangeAvatar}
              >
                <Text style={styles.changeAvatarText}>📷</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile.display_name || 'Používateľ'}</Text>

            {/* Badges */}
            <View style={styles.badgesContainer}>
              {profile.verified_email && (
                <View style={[styles.badge, styles.badgeEmail]}>
                  <Text style={styles.badgeText}>✉️ Email overený</Text>
                </View>
              )}
            </View>

            {/* Member Since */}
            <View style={styles.memberSince}>
              <Text style={styles.memberSinceIcon}>📅</Text>
              <Text style={styles.memberSinceText}>
                Člen {formatMemberSince(profile.member_since)}
              </Text>
            </View>
          </View>

          {/* Contact Button - Only show if NOT own profile */}
          {!isOwnProfile && (
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => navigation.navigate('Chat', { userId: profileId })}
            >
              <Text style={styles.contactButtonText}>💬 Kontaktovať</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {isOwnProfile && (
            <TouchableOpacity
              style={[styles.statCard, styles.statCardCoins]}
              onPress={() => navigation.navigate('Coins')}
            >
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>🪙</Text>
                <Text style={styles.statLabel}>Moje mince</Text>
              </View>
              <Text style={styles.statValue}>{coinBalance}</Text>
              <Text style={styles.statSubtext}>🛒 Kliknite pre nákup</Text>
            </TouchableOpacity>
          )}

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>⭐</Text>
              <Text style={styles.statLabel}>Hodnotenie</Text>
            </View>
            <Text style={styles.statValue}>{profile.rating_average || '0.0'}</Text>
            <Text style={styles.statSubtext}>{profile.rating_count} recenzií</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>📦</Text>
              <Text style={styles.statLabel}>Inzeráty</Text>
            </View>
            <Text style={styles.statValue}>{userAds.length}</Text>
            <Text style={styles.statSubtext}>aktívnych</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statLabel}>Predaných</Text>
            </View>
            <Text style={styles.statValue}>{profile.total_sales || 0}</Text>
            <Text style={styles.statSubtext}>produktov</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statLabel}>Overenia</Text>
            </View>
            <Text style={styles.statValue}>
              {[profile.verified_email, profile.verified_phone, profile.verified_id].filter(Boolean).length}/3
            </Text>
            <Text style={styles.statSubtext}>dokončené</Text>
          </View>
        </View>

        {/* Logout Button - Only show if own profile */}
        {isOwnProfile && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={async () => {
              Alert.alert(
                'Odhlásiť sa',
                'Naozaj sa chcete odhlásiť?',
                [
                  { text: 'Zrušiť', style: 'cancel' },
                  {
                    text: 'Odhlásiť',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await signOut();
                      } catch (error) {
                        console.error('Logout error:', error);
                        Alert.alert('Chyba', 'Nepodarilo sa odhlásiť');
                      }
                    },
                  },
                ],
              );
            }}
          >
            <Text style={styles.logoutButtonText}>🚪 Odhlásiť sa</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'ads' && styles.tabActive]}
          onPress={() => setActiveTab('ads')}
        >
          <Text style={[styles.tabText, activeTab === 'ads' && styles.tabTextActive]}>
            Inzeráty ({userAds.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'reviews' && styles.tabActive]}
          onPress={() => setActiveTab('reviews')}
        >
          <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
            Recenzie (0)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'ads' && (
        <View style={styles.tabContent}>
          {userAds.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Žiadne aktívne inzeráty</Text>
            </View>
          ) : (
            <View style={styles.adsGrid}>
              {userAds.map((ad) => (
                <TouchableOpacity
                  key={ad.id}
                  style={styles.adCard}
                  onPress={() => navigation.navigate('AdDetail', { id: ad.id })}
                >
                  <View style={styles.adImageContainer}>
                    {ad.images[0] ? (
                      <Image source={{ uri: ad.images[0] }} style={styles.adImage} />
                    ) : (
                      <View style={styles.adImagePlaceholder}>
                        <Text style={styles.adImagePlaceholderText}>Bez obrázku</Text>
                      </View>
                    )}
                    {ad.view_count > 0 && (
                      <View style={styles.viewCount}>
                        <Text style={styles.viewCountText}>👁 {ad.view_count}</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.adInfo}>
                    <Text style={styles.adTitle} numberOfLines={2}>{ad.title}</Text>
                    <Text style={styles.adPrice}>€{ad.price}</Text>
                    <Text style={styles.adLocation}>📍 {ad.location}</Text>
                    <Text style={styles.adDate}>🕐 {new Date(ad.created_at).toLocaleDateString('sk-SK')}</Text>
                  </View>
                  {isOwnProfile && (
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => navigation.navigate('EditAd', { id: ad.id })}
                    >
                      <Text style={styles.editButtonText}>✏️ Upraviť inzerát</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {activeTab === 'reviews' && (
        <View style={styles.tabContent}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>⭐</Text>
            <Text style={styles.emptyText}>Žiadne recenzie</Text>
          </View>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
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
    backgroundColor: colors.background.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
  },
  errorText: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.secondary,
  },
  profileCard: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  profileHeader: {
    marginBottom: spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 128,
    height: 128,
    borderRadius: borderRadius.full,
    borderWidth: 4,
    borderColor: colors.emerald[100],
  },
  avatarPlaceholder: {
    backgroundColor: colors.emerald[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[700],
  },
  changeAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.emerald[500],
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  changeAvatarText: {
    fontSize: 20,
  },
  profileInfo: {
    marginBottom: spacing.md,
  },
  profileName: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  badgeEmail: {
    backgroundColor: colors.emerald[100],
  },
  badgeText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: colors.emerald[700],
  },
  memberSince: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  memberSinceIcon: {
    fontSize: 16,
  },
  memberSinceText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  contactButton: {
    backgroundColor: colors.emerald[500],
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    flex: 1,
    minWidth: '45%',
  },
  statCardCoins: {
    backgroundColor: colors.emerald[50],
    borderWidth: 2,
    borderColor: colors.emerald[200],
  },
  logoutButton: {
    backgroundColor: colors.status.error,
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  statIcon: {
    fontSize: 16,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  statSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: colors.emerald[500],
  },
  tabText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  tabTextActive: {
    color: colors.emerald[500],
    fontWeight: typography.fontWeight.semibold,
  },
  tabContent: {
    backgroundColor: colors.white,
    marginTop: spacing.sm,
    padding: spacing.md,
  },
  emptyState: {
    paddingVertical: spacing['3xl'],
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  adsGrid: {
    gap: spacing.md,
  },
  adCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
    overflow: 'hidden',
  },
  adImageContainer: {
    position: 'relative',
    width: '100%',
    height: 200,
    backgroundColor: colors.gray[100],
  },
  adImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  adImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  adImagePlaceholderText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  viewCount: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  viewCountText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
  },
  adInfo: {
    padding: spacing.md,
  },
  adTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  adPrice: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
    marginBottom: spacing.xs,
  },
  adLocation: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  adDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  editButton: {
    backgroundColor: colors.gray[100],
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  editButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});
