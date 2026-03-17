import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../constants/theme';
import { Button } from './Button';

interface ModalDialogProps {
  visible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger';
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: colors.dark.secondary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingHorizontal: spacing[4],
    paddingTop: spacing[6],
    paddingBottom: spacing[6],
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: '600',
    color: colors.dark.text.primary,
    marginBottom: spacing[2],
  } as TextStyle,
  message: {
    fontSize: typography.sizes.base,
    color: colors.dark.text.secondary,
    marginBottom: spacing[6],
    lineHeight: 22,
  } as TextStyle,
  buttons: {
    gap: spacing[3],
  },
  cancelButton: {
    marginBottom: spacing[2],
  },
});

export function ModalDialog({
  visible,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
}: ModalDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttons}>
            {onCancel && (
              <Button
                title={cancelText}
                onPress={onCancel}
                variant="secondary"
                style={styles.cancelButton}
              />
            )}
            <Button title={confirmText} onPress={onConfirm} variant={confirmVariant} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
