import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

interface AIDescriptionGeneratorProps {
  visible: boolean;
  onClose: () => void;
  onGenerate: (description: string) => void;
  productInfo?: {
    title?: string;
    category?: string;
    condition?: string;
    price?: number;
  };
}

export function AIDescriptionGenerator({
  visible,
  onClose,
  onGenerate,
  productInfo,
}: AIDescriptionGeneratorProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generatedDescription, setGeneratedDescription] = useState('');
  const [customPrompt, setCustomPrompt] = useState('');

  const generateDescription = async () => {
    if (!user) return;

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_SUPABASE_URL}/functions/v1/generate-description`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            productInfo: {
              ...productInfo,
              additionalInfo: customPrompt,
            },
            userId: user.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await response.json();
      setGeneratedDescription(data.description);
    } catch (error) {
      console.error('Error generating description:', error);
      setGeneratedDescription(
        'Nepodarilo sa vygenerovať popis. Skúste to prosím znova.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseDescription = () => {
    onGenerate(generatedDescription);
    onClose();
  };

  const handleRegenerate = () => {
    setGeneratedDescription('');
    generateDescription();
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiIcon}>
              <Ionicons name="sparkles" size={20} color="#fff" />
            </View>
            <Text style={styles.headerTitle}>AI Generátor popisu</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>Informácie o produkte</Text>
            <View style={styles.infoGrid}>
              {productInfo?.title && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Názov:</Text>
                  <Text style={styles.infoValue}>{productInfo.title}</Text>
                </View>
              )}
              {productInfo?.category && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Kategória:</Text>
                  <Text style={styles.infoValue}>{productInfo.category}</Text>
                </View>
              )}
              {productInfo?.condition && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Stav:</Text>
                  <Text style={styles.infoValue}>{productInfo.condition}</Text>
                </View>
              )}
              {productInfo?.price && (
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Cena:</Text>
                  <Text style={styles.infoValue}>{productInfo.price} €</Text>
                </View>
              )}
            </View>
          </View>

          <View style={styles.promptSection}>
            <Text style={styles.promptLabel}>
              Doplňte ďalšie informácie (voliteľné)
            </Text>
            <TextInput
              style={styles.promptInput}
              placeholder="Napr. vek produktu, dôvod predaja, stav balenia..."
              placeholderTextColor="#9ca3af"
              value={customPrompt}
              onChangeText={setCustomPrompt}
              multiline
              numberOfLines={4}
            />
          </View>

          {!generatedDescription && (
            <TouchableOpacity
              style={styles.generateButton}
              onPress={generateDescription}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="sparkles" size={20} color="#fff" />
                  <Text style={styles.generateButtonText}>Vygenerovať popis</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {generatedDescription && (
            <View style={styles.resultSection}>
              <Text style={styles.resultTitle}>Vygenerovaný popis</Text>
              <View style={styles.resultBox}>
                <Text style={styles.resultText}>{generatedDescription}</Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={styles.regenerateButton}
                  onPress={handleRegenerate}
                  disabled={loading}
                >
                  <Ionicons name="refresh" size={18} color="#10b981" />
                  <Text style={styles.regenerateButtonText}>Vygenerovať znova</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.useButton}
                  onPress={handleUseDescription}
                >
                  <Ionicons name="checkmark-circle" size={18} color="#fff" />
                  <Text style={styles.useButtonText}>Použiť popis</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  infoGrid: {
    gap: 8,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  promptSection: {
    marginBottom: 24,
  },
  promptLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  promptInput: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 12,
    fontSize: 14,
    color: '#111827',
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resultSection: {
    marginTop: 24,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  resultBox: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#10b981',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#111827',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  regenerateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#d1fae5',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  regenerateButtonText: {
    color: '#10b981',
    fontSize: 14,
    fontWeight: '600',
  },
  useButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
