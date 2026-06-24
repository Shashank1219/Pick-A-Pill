import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

const DEFAULT_FAB_BOTTOM = 24;

interface Props {
  onPress: () => void;
  visible: boolean;
  bottom?: number;
}

export function FAB({ onPress, visible, bottom }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: bottom ?? DEFAULT_FAB_BOTTOM }]}
      onPress={onPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel="Add medication">
      <Text style={styles.icon}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 24,
    width: 80,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  icon: {
    ...Typography.title,
    color: Colors.textOnNavy,
    lineHeight: 28,
  },
});
