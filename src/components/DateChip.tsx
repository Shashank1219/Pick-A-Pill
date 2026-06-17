import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { format } from 'date-fns';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  date: Date;
  isSelected: boolean;
  onPress: () => void;
}

export function DateChip({ date, isSelected, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.chip, isSelected && styles.chipSelected]}
      onPress={onPress}
      activeOpacity={0.75}>
      <Text style={[styles.weekday, isSelected && styles.textSelected]}>
        {format(date, 'EEE')}
      </Text>
      <Text style={[styles.day, isSelected && styles.textSelected]}>
        {format(date, 'd')}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    width: 44,
    height: 56,
    borderRadius: 20,
    backgroundColor: Colors.chipInactive,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: Colors.navy,
  },
  weekday: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  day: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginTop: 2,
  },
  textSelected: {
    color: Colors.textOnNavy,
  },
});
