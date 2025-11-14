import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { categories } from '../constants/categories';
import { getCategoryFields } from '../lib/category-fields-mobile';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

export default function EditAdScreen({ route, navigation }: any) {
  const { id } = route.params;
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [categoryData, setCategoryData] = useState<Record<string, any>>({});
  const [initialLoading, setInitialLoading] = useState(true);

  const categoryFields = category ? getCategoryFields(category) : [];

  useEffect(() => {
    loadAdData();
  }, [id]);

  const loadAdData = async () => {
    try {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setPrice(data.price?.toString() || '');
        setCategory(data.category_id || '');
        setLocation(data.location || '');
        setPostalCode(data.postal_code || '');
        setPhone(data.phone || '');
        setImages(data.images || []);
        setCategoryData(data.specs || {});
      }
    } catch (error) {
      console.error('Error loading ad:', error);
      Alert.alert('Chyba', 'Nepodarilo sa načítať inzerát');
      navigation.goBack();
    } finally {
      setInitialLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Chyba', 'Potrebujeme prístup k vašim fotografiám');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setUploading(true);
        const url = await uploadImage(result.assets[0].uri);

        if (url) {
          setImages([...images, url]);
        }
        setUploading(false);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setUploading(false);
      Alert.alert('Chyba', 'Nepodarilo sa načítať fotografie');
    }
  };

  const uploadImage = async (uri: string): Promise<string | null> => {
    try {
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileName = `${user?.id}/${Date.now()}.jpg`;

      const { data, error } = await supabase.storage
        .from('ad-images')
        .upload(fileName, arrayBuffer, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('ad-images')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Chyba', `Nepodarilo sa nahrať obrázok: ${error?.message || 'Neznáma chyba'}`);
      return null;
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !description || !price || !category || !location) {
      Alert.alert('Chyba', 'Vyplňte všetky povinné polia');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Chyba', 'Pridajte aspoň jednu fotografiu');
      return;
    }

    setLoading(true);
    try {
      const adData: any = {
        title,
        description,
        price: parseFloat(price),
        category_id: category,
        location,
        postal_code: postalCode,
        phone: phone || null,
        images,
      };

      if (Object.keys(categoryData).length > 0) {
        adData.specs = categoryData;
      }

      const { error } = await supabase
        .from('ads')
        .update(adData)
        .eq('id', id);

      if (error) throw error;

      Alert.alert('Úspech', 'Inzerát bol aktualizovaný!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Chyba', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: any) => {
    const value = categoryData[field.id] || '';

    if (field.type === 'text' || field.type === 'number') {
      return (
        <View key={field.id} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label} {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <View style={styles.inputWithUnit}>
            <TextInput
              style={[styles.input, field.unit && { flex: 1 }]}
              value={value}
              onChangeText={(text) => setCategoryData({ ...categoryData, [field.id]: text })}
              placeholder={field.placeholder}
              placeholderTextColor={colors.gray[400]}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            />
            {field.unit && <Text style={styles.unitText}>{field.unit}</Text>}
          </View>
        </View>
      );
    }

    if (field.type === 'select') {
      return (
        <View key={field.id} style={styles.fieldContainer}>
          <Text style={styles.fieldLabel}>
            {field.label} {field.required && <Text style={styles.required}>*</Text>}
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={value}
              onValueChange={(itemValue) => setCategoryData({ ...categoryData, [field.id]: itemValue })}
              style={styles.picker}
            >
              <Picker.Item label="Vyberte..." value="" />
              {field.options?.map((option: string) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </View>
        </View>
      );
    }

    return null;
  };

  if (initialLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.emerald[500]} />
        <Text style={styles.loadingText}>Načítavam inzerát...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Upraviť inzerát</Text>
        <Text style={styles.headerSubtitle}>
          Upravte údaje o vašom inzeráte
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Fotografie <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.hint}>Pridajte až 10 fotografií</Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imagesScroll}>
          {images.map((uri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri }} style={styles.imagePreview} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}

          {images.length < 10 && (
            <TouchableOpacity
              style={styles.addImageButton}
              onPress={pickImage}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color={colors.emerald[500]} />
              ) : (
                <>
                  <Text style={styles.addImageIcon}>📷</Text>
                  <Text style={styles.addImageText}>Pridať</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Kategória <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => {
              setCategory(itemValue);
              setCategoryData({});
            }}
            style={styles.picker}
          >
            <Picker.Item label="Vyberte kategóriu..." value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat.id} label={`${cat.icon} ${cat.name}`} value={cat.id} />
            ))}
          </Picker>
        </View>
      </View>

      {categoryFields.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Špecifikácie</Text>
          {categoryFields.map(renderField)}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.label}>
          Názov <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Napr. iPhone 15 Pro, 256GB, Čierny"
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Popis <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Podrobný popis produktu, stav, prípadné závady..."
          placeholderTextColor={colors.gray[400]}
          multiline
          numberOfLines={6}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Cena <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.priceInput}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            value={price}
            onChangeText={setPrice}
            placeholder="0"
            placeholderTextColor={colors.gray[400]}
            keyboardType="decimal-pad"
          />
          <Text style={styles.priceUnit}>€</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>
          Lokalita <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="Napr. Bratislava"
          placeholderTextColor={colors.gray[400]}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>PSČ</Text>
        <TextInput
          style={styles.input}
          value={postalCode}
          onChangeText={setPostalCode}
          placeholder="Napr. 81101"
          placeholderTextColor={colors.gray[400]}
          keyboardType="number-pad"
          maxLength={5}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Telefónne číslo</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Napr. +421 900 000 000"
          placeholderTextColor={colors.gray[400]}
          keyboardType="phone-pad"
        />
      </View>

      <TouchableOpacity
        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={loading || uploading}
      >
        {loading ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text style={styles.submitButtonText}>Uložiť zmeny</Text>
        )}
      </TouchableOpacity>

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background.primary,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.secondary,
  },
  header: {
    padding: spacing.lg,
    backgroundColor: colors.white,
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
  section: {
    padding: spacing.md,
    backgroundColor: colors.white,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.status.error,
  },
  hint: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    backgroundColor: colors.white,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  unitText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.secondary,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  priceInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceUnit: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: colors.border.light,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  picker: {
    height: 50,
  },
  imagesScroll: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  imagePreview: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.gray[100],
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.status.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: typography.fontWeight.bold,
  },
  addImageButton: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    borderColor: colors.border.default,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray[50],
  },
  addImageIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  addImageText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semibold,
  },
  submitButton: {
    backgroundColor: colors.emerald[500],
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    margin: spacing.md,
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
  },
});
