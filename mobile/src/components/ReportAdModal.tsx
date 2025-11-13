import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { colors, spacing, borderRadius, typography } from '../theme/colors';

interface ReportAdModalProps {
  visible: boolean;
  onClose: () => void;
  adId: string;
  userId: string;
}

const REPORT_REASONS = [
  { id: 'spam', label: 'Spam alebo podvod' },
  { id: 'inappropriate', label: 'Nevhodný obsah' },
  { id: 'wrong_category', label: 'Nesprávna kategória' },
  { id: 'duplicate', label: 'Duplicitný inzerát' },
  { id: 'sold', label: 'Už predané' },
  { id: 'other', label: 'Iné' },
];

export default function ReportAdModal({
  visible,
  onClose,
  adId,
  userId,
}: ReportAdModalProps) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedReason) {
      Alert.alert('Chyba', 'Prosím vyberte dôvod nahlásenia');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Chyba', 'Prosím uveďte popis problému');
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from('ad_reports').insert({
        ad_id: adId,
        reporter_id: userId,
        reason: selectedReason,
        description: description.trim(),
        status: 'pending',
      });

      if (error) throw error;

      Alert.alert(
        'Úspech',
        'Ďakujeme za nahlásenie. Váš report bude čoskoro preskúmaný.'
      );
      setSelectedReason('');
      setDescription('');
      onClose();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      Alert.alert('Chyba', error.message || 'Nepodarilo sa odoslať nahlásenie');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Nahlásiť inzerát</Text>

            <Text style={styles.label}>Dôvod nahlásenia</Text>
            <View style={styles.reasonsList}>
              {REPORT_REASONS.map((reason) => (
                <TouchableOpacity
                  key={reason.id}
                  style={[
                    styles.reasonButton,
                    selectedReason === reason.id && styles.reasonButtonSelected,
                  ]}
                  onPress={() => setSelectedReason(reason.id)}
                >
                  <View style={styles.radioButton}>
                    {selectedReason === reason.id && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.reasonText,
                      selectedReason === reason.id && styles.reasonTextSelected,
                    ]}
                  >
                    {reason.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Popis problému</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={4}
              placeholder="Uveďte prosím viac detailov..."
              value={description}
              onChangeText={setDescription}
              textAlignVertical="top"
            />

            <View style={styles.buttons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={onClose}
                disabled={submitting}
              >
                <Text style={styles.cancelButtonText}>Zrušiť</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.submitButton]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? 'Odosiela sa...' : 'Odoslať'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.white,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    padding: spacing.lg,
    maxHeight: '90%',
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  reasonsList: {
    marginBottom: spacing.lg,
  },
  reasonButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  reasonButtonSelected: {
    borderColor: colors.emerald[500],
    backgroundColor: colors.emerald[50],
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border.default,
    marginRight: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.emerald[500],
  },
  reasonText: {
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    flex: 1,
  },
  reasonTextSelected: {
    fontWeight: typography.fontWeight.semibold,
    color: colors.emerald[700],
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.text.primary,
    marginBottom: spacing.lg,
    minHeight: 100,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
  },
  submitButton: {
    backgroundColor: '#ef4444',
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.white,
  },
});
