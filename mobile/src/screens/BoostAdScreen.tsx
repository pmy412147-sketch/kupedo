import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface BoostPackage {
  id: string;
  name: string;
  duration: number;
  coins: number;
  savings: number;
  popular: boolean;
}

const BOOST_PACKAGES: BoostPackage[] = [
  { id: '7day', name: '7 dní', duration: 7, coins: 50, savings: 0, popular: false },
  { id: '14day', name: '14 dní', duration: 14, coins: 90, savings: 10, popular: true },
  { id: '30day', name: '30 dní', duration: 30, coins: 150, savings: 50, popular: false },
];

export default function BoostAdScreen({ route, navigation }: any) {
  const { adId } = route.params;
  const { user } = useAuth();
  const [ad, setAd] = useState<any>(null);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (user) {
      loadAd();
      loadUserCoins();
    }
  }, [user, adId]);

  const loadAd = async () => {
    const { data, error } = await supabase
      .from('ads')
      .select('id, title, price, is_boosted, boosted_until')
      .eq('id', adId)
      .single();

    if (error) {
      console.error('Error loading ad:', error);
      return;
    }

    if (data) {
      setAd(data);
    }
    setLoading(false);
  };

  const loadUserCoins = async () => {
    const { data } = await supabase
      .from('user_coins')
      .select('balance')
      .eq('user_id', user?.id)
      .maybeSingle();

    if (data) {
      setUserCoins(data.balance);
    }
  };

  const handleBoost = async (pkg: BoostPackage) => {
    if (!user || !ad) return;

    if (userCoins < pkg.coins) {
      Alert.alert(
        'Nedostatok mincí',
        'Nemáte dostatok mincí. Chcete si kúpiť mince?',
        [
          { text: 'Zrušiť', style: 'cancel' },
          { text: 'Kúpiť mince', onPress: () => navigation.navigate('Coins') }
        ]
      );
      return;
    }

    Alert.alert(
      'Potvrdiť TOP-ovanie',
      `Chcete TOP-ovať inzerát na ${pkg.duration} dní za ${pkg.coins} mincí?`,
      [
        { text: 'Zrušiť', style: 'cancel' },
        {
          text: 'Potvrdiť',
          onPress: async () => {
            setProcessing(true);

            try {
              const boostedUntil = new Date();
              boostedUntil.setDate(boostedUntil.getDate() + pkg.duration);

              const { error: updateError } = await supabase
                .from('ads')
                .update({
                  is_boosted: true,
                  boosted_until: boostedUntil.toISOString()
                })
                .eq('id', ad.id);

              if (updateError) throw updateError;

              const { error: coinsError } = await supabase.rpc('deduct_coins', {
                user_uuid: user.id,
                amount: pkg.coins
              });

              if (coinsError) throw coinsError;

              await supabase.from('coin_transactions').insert({
                user_id: user.id,
                amount: -pkg.coins,
                type: 'boost',
                description: `TOP inzerát: ${ad.title} (${pkg.name})`
              });

              Alert.alert(
                'Úspech!',
                `Inzerát bol úspešne TOP-ovaný na ${pkg.duration} dní!`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error boosting ad:', error);
              Alert.alert('Chyba', 'Nepodarilo sa TOP-ovať inzerát. Skúste to prosím znova.');
            } finally {
              setProcessing(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Načítavam...</Text>
        </View>
      </View>
    );
  }

  if (!ad) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Inzerát sa nenašiel</Text>
        </View>
      </View>
    );
  }

  const isAlreadyBoosted = ad.is_boosted && ad.boosted_until && new Date(ad.boosted_until) > new Date();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>TOP-ovať inzerát</Text>
        <Text style={styles.headerSubtitle}>
          Zvýšte viditeľnosť vášho inzerátu a získajte viac záujemcov
        </Text>
      </View>

      <View style={styles.adInfoCard}>
        <Text style={styles.adTitle}>{ad.title}</Text>
        <Text style={styles.adPrice}>
          {new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR' }).format(ad.price)}
        </Text>
        {isAlreadyBoosted && (
          <View style={styles.alreadyBoostedBadge}>
            <Text style={styles.alreadyBoostedText}>⭐ Už je TOP</Text>
            {ad.boosted_until && (
              <Text style={styles.boostedUntilText}>
                Do: {new Date(ad.boosted_until).toLocaleDateString('sk-SK')}
              </Text>
            )}
          </View>
        )}
      </View>

      <View style={styles.benefitsCard}>
        <Text style={styles.benefitsTitle}>📈 Prečo TOP-ovať?</Text>
        <View style={styles.benefitsList}>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>👁️</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Viac zobrazení</Text>
              <Text style={styles.benefitDesc}>Až o 300% viac ľudí uvidí váš inzerát</Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>⭐</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Zvýraznenie</Text>
              <Text style={styles.benefitDesc}>Váš inzerát bude farebne zvýraznený</Text>
            </View>
          </View>
          <View style={styles.benefitItem}>
            <Text style={styles.benefitIcon}>📈</Text>
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Vyššia pozícia</Text>
              <Text style={styles.benefitDesc}>Zobrazí sa vyššie vo výsledkoch</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.coinsBalance}>
        <Text style={styles.coinsBalanceLabel}>Váš zostatok:</Text>
        <Text style={styles.coinsBalanceAmount}>{userCoins} mincí</Text>
      </View>

      <View style={styles.packagesContainer}>
        <Text style={styles.packagesTitle}>Vyberte balíček</Text>

        {BOOST_PACKAGES.map((pkg) => (
          <View
            key={pkg.id}
            style={[styles.packageCard, pkg.popular && styles.packageCardPopular]}
          >
            {pkg.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Najpopulárnejšie</Text>
              </View>
            )}

            <View style={styles.packageHeader}>
              <Text style={styles.packageName}>{pkg.name}</Text>
              {pkg.savings > 0 && (
                <View style={styles.savingsBadge}>
                  <Text style={styles.savingsBadgeText}>Ušetríte {pkg.savings} mincí</Text>
                </View>
              )}
            </View>

            <Text style={styles.packageCoins}>{pkg.coins} mincí</Text>

            <View style={styles.packageBenefits}>
              <Text style={styles.packageBenefit}>✓ Zvýraznenie v zozname</Text>
              <Text style={styles.packageBenefit}>✓ Vyššia pozícia vo výsledkoch</Text>
              <Text style={styles.packageBenefit}>✓ +300% viac zobrazení</Text>
              {pkg.savings > 0 && (
                <Text style={styles.packageBenefit}>✓ Ušetríte {pkg.savings} mincí</Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.packageButton,
                pkg.popular && styles.packageButtonPopular,
                (processing || userCoins < pkg.coins) && styles.packageButtonDisabled
              ]}
              onPress={() => handleBoost(pkg)}
              disabled={processing || userCoins < pkg.coins}
            >
              <Text style={[styles.packageButtonText, pkg.popular && styles.packageButtonTextPopular]}>
                {processing ? 'Spracováva sa...' : userCoins < pkg.coins ? 'Nedostatok mincí' : 'Aktivovať'}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {userCoins < BOOST_PACKAGES[0].coins && (
        <View style={styles.noCoinsCard}>
          <Text style={styles.noCoinsText}>
            Nemáte dostatok mincí na TOP-ovanie inzerátu.
          </Text>
          <TouchableOpacity
            style={styles.buyCoinsButton}
            onPress={() => navigation.navigate('Coins')}
          >
            <Text style={styles.buyCoinsButtonText}>Kúpiť mince</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ height: spacing.xl }} />
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
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  adInfoCard: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  adTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  adPrice: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
  },
  alreadyBoostedBadge: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
  },
  alreadyBoostedText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: '#FF9500',
  },
  boostedUntilText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  benefitsCard: {
    backgroundColor: '#F0FDF4',
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.emerald[200],
  },
  benefitsTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  benefitsList: {
    gap: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  benefitIcon: {
    fontSize: 20,
  },
  benefitText: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  benefitDesc: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  coinsBalance: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  coinsBalanceLabel: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  coinsBalanceAmount: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
  },
  packagesContainer: {
    paddingHorizontal: spacing.md,
  },
  packagesTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  packageCard: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    position: 'relative',
  },
  packageCardPopular: {
    borderColor: colors.emerald[500],
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    left: spacing.md,
    backgroundColor: colors.emerald[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  popularBadgeText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  packageName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  savingsBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  savingsBadgeText: {
    color: '#DC2626',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
  },
  packageCoins: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[600],
    marginBottom: spacing.md,
  },
  packageBenefits: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  packageBenefit: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  packageButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  packageButtonPopular: {
    backgroundColor: colors.emerald[500],
    borderColor: colors.emerald[500],
  },
  packageButtonDisabled: {
    opacity: 0.5,
  },
  packageButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  packageButtonTextPopular: {
    color: colors.white,
  },
  noCoinsCard: {
    backgroundColor: '#FEF3C7',
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#FCD34D',
    alignItems: 'center',
  },
  noCoinsText: {
    fontSize: typography.fontSize.sm,
    color: '#92400E',
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  buyCoinsButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
  },
  buyCoinsButtonText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
});
