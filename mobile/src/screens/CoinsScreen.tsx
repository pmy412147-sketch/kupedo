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

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  bonus_coins: number;
  popular: boolean;
}

export default function CoinsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
    loadUserCoins();
  }, []);

  const loadPackages = async () => {
    try {
      const { data, error } = await supabase
        .from('coin_packages')
        .select('*')
        .order('price', { ascending: true });

      if (error) throw error;
      if (data) setPackages(data);
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
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

  const handleBuyPackage = (pkg: CoinPackage) => {
    Alert.alert(
      'Kúpiť mince',
      `Chcete kúpiť ${pkg.coins + pkg.bonus_coins} mincí za ${pkg.price}€?`,
      [
        { text: 'Zrušiť', style: 'cancel' },
        {
          text: 'Kúpiť',
          onPress: () => buyPackage(pkg),
        },
      ]
    );
  };

  const buyPackage = async (pkg: CoinPackage) => {
    Alert.alert('Info', 'Platobný systém bude pridaný neskôr. Momentálne je táto funkcia len demo.');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sk-SK', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Váš zostatok</Text>
          <View style={styles.balanceAmount}>
            <Text style={styles.coinIcon}>🪙</Text>
            <Text style={styles.balanceValue}>{userCoins}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kúpiť mince</Text>
        <Text style={styles.sectionSubtitle}>
          Používajte mince na vylepšenie vašich inzerátov
        </Text>

        <View style={styles.packages}>
          {packages.map((pkg) => (
            <TouchableOpacity
              key={pkg.id}
              style={[
                styles.packageCard,
                pkg.popular && styles.packageCardPopular,
              ]}
              onPress={() => handleBuyPackage(pkg)}
            >
              {pkg.popular && (
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>⭐ POPULÁRNE</Text>
                </View>
              )}

              <Text style={styles.packageName}>{pkg.name}</Text>

              <View style={styles.packageCoins}>
                <Text style={styles.packageCoinIcon}>🪙</Text>
                <Text style={styles.packageCoinAmount}>
                  {pkg.coins + pkg.bonus_coins}
                </Text>
              </View>

              {pkg.bonus_coins > 0 && (
                <View style={styles.bonusBadge}>
                  <Text style={styles.bonusText}>
                    +{pkg.bonus_coins} BONUS
                  </Text>
                </View>
              )}

              <Text style={styles.packagePrice}>{formatPrice(pkg.price)}</Text>

              <TouchableOpacity
                style={[
                  styles.buyButton,
                  pkg.popular && styles.buyButtonPopular,
                ]}
                onPress={() => handleBuyPackage(pkg)}
              >
                <Text
                  style={[
                    styles.buyButtonText,
                    pkg.popular && styles.buyButtonTextPopular,
                  ]}
                >
                  Kúpiť
                </Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>Ako použiť mince?</Text>
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>⭐</Text>
            <Text style={styles.infoText}>
              Zvýraznite inzerát (50 mincí) - váš inzerát sa zobrazí na prvých miestach
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>🔄</Text>
            <Text style={styles.infoText}>
              Obnovte inzerát (20 mincí) - posunite inzerát na začiatok zoznamu
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.infoBullet}>📊</Text>
            <Text style={styles.infoText}>
              Štatistiky (10 mincí) - získajte detailné štatistiky o vašom inzeráte
            </Text>
          </View>
        </View>
      </View>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.secondary,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
  },
  balanceCard: {
    backgroundColor: colors.emerald[50],
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.emerald[700],
    marginBottom: spacing.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  coinIcon: {
    fontSize: 32,
  },
  balanceValue: {
    fontSize: typography.fontSize['4xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[700],
  },
  section: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  sectionSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.lg,
  },
  packages: {
    gap: spacing.md,
  },
  packageCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.border.light,
    position: 'relative',
  },
  packageCardPopular: {
    borderColor: colors.emerald[500],
    backgroundColor: colors.emerald[50],
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    alignSelf: 'center',
    backgroundColor: colors.emerald[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  popularText: {
    color: colors.white,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
  },
  packageName: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  packageCoins: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  packageCoinIcon: {
    fontSize: 40,
  },
  packageCoinAmount: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  bonusBadge: {
    alignSelf: 'center',
    backgroundColor: colors.emerald[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginBottom: spacing.md,
  },
  bonusText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.emerald[700],
  },
  packagePrice: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  buyButton: {
    backgroundColor: colors.emerald[500],
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  buyButtonPopular: {
    backgroundColor: colors.emerald[600],
  },
  buyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
  buyButtonTextPopular: {
    color: colors.white,
  },
  infoSection: {
    padding: spacing.lg,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  infoTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  infoList: {
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  infoBullet: {
    fontSize: 20,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
});
