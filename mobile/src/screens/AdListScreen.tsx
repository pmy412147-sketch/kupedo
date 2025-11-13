import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Image,
  Dimensions,
  StatusBar,
  Modal,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { categories } from '../constants/categories';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function AdListScreen({ navigation, route }: any) {
  const [ads, setAds] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(route.params?.search || '');
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(route.params?.category || 'all');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadAds();
  }, [selectedCategory]);

  const loadAds = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('ads')
        .select('*')
        .eq('status', 'active')
        .order('is_boosted', { ascending: false })
        .order('created_at', { ascending: false });

      if (selectedCategory && selectedCategory !== 'all') {
        query = query.eq('category_id', selectedCategory);
      }

      if (searchQuery.trim()) {
        const searchTerm = searchQuery.toLowerCase().trim();
        query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`);
      }

      if (priceFrom) {
        query = query.gte('price', parseFloat(priceFrom));
      }

      if (priceTo) {
        query = query.lte('price', parseFloat(priceTo));
      }

      const { data, error } = await query;
      if (error) throw error;
      if (data) setAds(data);
    } catch (error) {
      console.error('Error loading ads:', error);
    } finally {
      setLoading(false);
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

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : categoryId;
  };

  const handleSearch = () => {
    loadAds();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceFrom('');
    setPriceTo('');
    setShowFilters(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Hľadať inzeráty..."
            placeholderTextColor={colors.gray[400]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {selectedCategory && selectedCategory !== 'all' && (
          <View style={styles.filterChip}>
            <Text style={styles.filterChipText}>
              {getCategoryName(selectedCategory)}
            </Text>
            <TouchableOpacity onPress={() => setSelectedCategory('all')}>
              <Text style={styles.filterChipClose}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <FlatList
        data={ads}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.adCard}
            onPress={() => navigation.navigate('AdDetail', { id: item.id })}
          >
            {item.images && item.images.length > 0 ? (
              <Image
                source={{ uri: item.images[0] }}
                style={styles.adImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.adImage, styles.adImagePlaceholder]}>
                <Text style={styles.placeholderText}>📷</Text>
              </View>
            )}

            {item.is_boosted && (
              <View style={styles.boostedBadge}>
                <Text style={styles.boostedText}>⭐ TOP</Text>
              </View>
            )}

            <View style={styles.adInfo}>
              <Text style={styles.adTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.adPrice}>{formatPrice(item.price)}</Text>
              <Text style={styles.adLocation} numberOfLines={1}>
                📍 {item.location}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        refreshing={loading}
        onRefresh={loadAds}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyText}>Žiadne inzeráty nenájdené</Text>
              <TouchableOpacity style={styles.emptyButton} onPress={clearFilters}>
                <Text style={styles.emptyButtonText}>Vymazať filtre</Text>
              </TouchableOpacity>
            </View>
          ) : null
        }
      />

      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtre</Text>
              <TouchableOpacity onPress={() => setShowFilters(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Kategória</Text>
              <View style={styles.categoryChips}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    selectedCategory === 'all' && styles.categoryChipActive
                  ]}
                  onPress={() => setSelectedCategory('all')}
                >
                  <Text style={[
                    styles.categoryChipText,
                    selectedCategory === 'all' && styles.categoryChipTextActive
                  ]}>
                    Všetky
                  </Text>
                </TouchableOpacity>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.id && styles.categoryChipActive
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === cat.id && styles.categoryChipTextActive
                    ]}>
                      {cat.icon} {cat.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Cena</Text>
              <View style={styles.priceInputs}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Od €"
                  placeholderTextColor={colors.gray[400]}
                  value={priceFrom}
                  onChangeText={setPriceFrom}
                  keyboardType="numeric"
                />
                <Text style={styles.priceSeparator}>-</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Do €"
                  placeholderTextColor={colors.gray[400]}
                  value={priceTo}
                  onChangeText={setPriceTo}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={clearFilters}
              >
                <Text style={styles.clearButtonText}>Vymazať</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={handleSearch}
              >
                <Text style={styles.applyButtonText}>Použiť filtre</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingTop: 50,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
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
  filterButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 20,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.emerald[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  filterChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.emerald[700],
    fontWeight: typography.fontWeight.semibold,
    marginRight: spacing.xs,
  },
  filterChipClose: {
    fontSize: typography.fontSize.sm,
    color: colors.emerald[700],
  },
  listContainer: {
    padding: spacing.sm,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: spacing.sm,
  },
  adCard: {
    width: (width - spacing.md * 2) / 2 - spacing.xs,
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
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
  emptyContainer: {
    alignItems: 'center',
    padding: spacing.xxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  emptyButton: {
    backgroundColor: colors.emerald[500],
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xxl,
    borderTopRightRadius: borderRadius.xxl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  modalClose: {
    fontSize: typography.fontSize['2xl'],
    color: colors.text.secondary,
  },
  filterSection: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  categoryChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  categoryChipActive: {
    backgroundColor: colors.emerald[500],
  },
  categoryChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.primary,
  },
  categoryChipTextActive: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  priceSeparator: {
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  modalActions: {
    flexDirection: 'row',
    padding: spacing.lg,
    gap: spacing.sm,
  },
  clearButton: {
    flex: 1,
    backgroundColor: colors.gray[200],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  applyButton: {
    flex: 2,
    backgroundColor: colors.emerald[500],
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  applyButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
