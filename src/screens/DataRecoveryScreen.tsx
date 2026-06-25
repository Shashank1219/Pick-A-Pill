import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { clearDataRecoveryNeeded } from '@/storage/mmkvStorage';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  onContinue: () => void;
}

export function DataRecoveryScreen({ onContinue }: Props) {
  const handleContinue = () => {
    clearDataRecoveryNeeded();
    onContinue();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Data issue detected</Text>
      <Text style={styles.message}>
        Something went wrong, your data may have been reset. You can continue,
        but please review your courses.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={handleContinue}
        activeOpacity={0.75}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
  button: {
    marginTop: 24,
    height: 56,
    paddingHorizontal: 32,
    backgroundColor: Colors.mint,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...Typography.bodySemiBold,
    color: Colors.navy,
  },
});
