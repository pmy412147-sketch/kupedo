import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';

interface VisualSimilarSearchProps {
  onSearch?: (imageUri: string) => void;
}

export function VisualSimilarSearch({ onSearch }: VisualSimilarSearchProps) {
  const navigation = useNavigation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Povolenie potrebné',
        'Pre použitie tejto funkcie potrebujeme prístup k vašim fotkám.'
      );
      return;
    }

    const result = await ImagePicker.launchImagePickraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      handleSearch(imageUri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Povolenie potrebné',
        'Pre použitie tejto funkcie potrebujeme prístup k vašej kamere.'
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      const imageUri = result.assets[0].uri;
      setSelectedImage(imageUri);
      handleSearch(imageUri);
    }
  };

  const handleSearch = async (imageUri: string) => {
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'search.jpg',
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/visual-search`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();

      if (onSearch) {
        onSearch(imageUri);
      }

      // Navigate to results
      navigation.navigate('SearchResults' as never, {
        query: data.analysis || 'Vizuálne vyhľadávanie',
        visualSearch: true,
      } as never);
    } catch (error) {
      console.error('Visual search error:', error);
      Alert.alert(
        'Chyba',
        'Nepodarilo sa vyhľadať podobné produkty. Skúste to prosím znova.'
      );
    } finally {
      setLoading(false);
    }
  };

  const showOptions = () => {
    Alert.alert(
      'Vizuálne vyhľadávanie',
      'Vyberte zdroj obrázka',
      [
        {
          text: 'Vybrať z galérie',
          onPress: pickImage,
        },
        {
          text: 'Odfotiť',
          onPress: takePhoto,
        },
        {
          text: 'Zrušiť',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={showOptions}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#10b981" />
      ) : (
        <Ionicons name="camera-outline" size={20} color="#10b981" />
      )}
      <Text style={styles.buttonText}>Hľadať podľa fotky</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  buttonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
});
