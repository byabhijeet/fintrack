import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { useAppTheme } from '../theme';
import { useAlertStore } from '../store/alertStore';

export default function AlertModal() {
  const { colors, typography, spacing, borderRadius } = useAppTheme();
  const { visible, title, message, buttons, options, hideAlert } = useAlertStore();

  if (!visible) return null;

  const handleButtonPress = (onPress?: () => void) => {
    hideAlert();
    if (onPress) {
      onPress();
    }
  };

  const onBackdropPress = () => {
    if (options.cancelable !== false) {
      hideAlert();
      if (options.onDismiss) {
        options.onDismiss();
      }
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onBackdropPress}
    >
      <Pressable style={styles.overlay} onPress={onBackdropPress}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={[
            styles.alertContainer,
            {
              backgroundColor: colors.surfaceElevated,
              borderRadius: borderRadius.md,
              padding: spacing.lg,
              maxWidth: Platform.OS === 'web' ? 400 : '85%',
              borderWidth: 1,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              typography.sectionTitle,
              { color: colors.textPrimary, marginBottom: spacing.sm },
            ]}
          >
            {title}
          </Text>

          {message ? (
            <Text
              style={[
                typography.bodyMd,
                { color: colors.textSecondary, marginBottom: spacing.lg },
              ]}
            >
              {message}
            </Text>
          ) : null}

          <View
            style={[
              styles.buttonContainer,
              {
                flexDirection: buttons.length > 2 ? 'column' : 'row',
                gap: spacing.md,
              },
            ]}
          >
            {buttons.map((button, index) => {
              const isDestructive = button.style === 'destructive';
              const isCancel = button.style === 'cancel';

              return (
                <TouchableOpacity
                  key={index}
                  accessibilityRole="button"
                  style={[
                    styles.button,
                    {
                      flex: buttons.length > 2 ? 0 : 1,
                      backgroundColor: isDestructive
                        ? colors.error
                        : isCancel
                        ? colors.surface
                        : colors.primary,
                    },
                  ]}
                  onPress={() => handleButtonPress(button.onPress)}
                >
                  <Text
                    style={[
                      typography.label,
                      {
                        color: isDestructive
                          ? '#FFFFFF'
                          : isCancel
                          ? colors.textSecondary
                          : '#000000',
                        textAlign: 'center',
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '100%',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 10,
  },
  buttonContainer: {
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
