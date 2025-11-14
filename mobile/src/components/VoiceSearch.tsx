import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

interface VoiceSearchProps {
  onSearch?: (query: string) => void;
}

export function VoiceSearch({ onSearch }: VoiceSearchProps) {
  const navigation = useNavigation();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const pulseAnim = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (isRecording) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Povolenie potrebné',
          'Pre použitie hlasového vyhľadávania potrebujeme prístup k mikrofónu.'
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Chyba', 'Nepodarilo sa spustiť nahrávanie.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    setIsRecording(false);
    setLoading(true);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (!uri) {
        throw new Error('No recording URI');
      }

      // Send to speech-to-text API
      const formData = new FormData();
      formData.append('audio', {
        uri,
        type: 'audio/m4a',
        name: 'recording.m4a',
      } as any);

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/speech-to-text`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Speech recognition failed');
      }

      const data = await response.json();
      const searchQuery = data.text || '';

      if (searchQuery) {
        if (onSearch) {
          onSearch(searchQuery);
        }

        // Navigate to search results
        navigation.navigate('SearchResults' as never, {
          query: searchQuery,
        } as never);
      } else {
        Alert.alert('Chyba', 'Nepodarilo sa rozpoznať hlas. Skúste to znova.');
      }
    } catch (error) {
      console.error('Voice search error:', error);
      Alert.alert(
        'Chyba',
        'Nepodarilo sa spracovať hlasové vyhľadávanie. Skúste to prosím znova.'
      );
    } finally {
      setRecording(null);
      setLoading(false);
    }
  };

  const handlePress = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handlePress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#10b981" />
      ) : (
        <Animated.View
          style={[
            styles.iconContainer,
            isRecording && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Ionicons
            name={isRecording ? 'mic' : 'mic-outline'}
            size={20}
            color={isRecording ? '#ef4444' : '#10b981'}
          />
        </Animated.View>
      )}
      <Text style={[styles.buttonText, isRecording && styles.recordingText]}>
        {isRecording ? 'Nahrávam...' : 'Hlasové vyhľadávanie'}
      </Text>
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
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  recordingText: {
    color: '#ef4444',
  },
});
