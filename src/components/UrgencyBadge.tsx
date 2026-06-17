import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { UrgencyLevel } from '@/types';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  level: UrgencyLevel;
}

function colors(level: UrgencyLevel): { bg: string; text: string } {
  switch (level) {
    case 'High':
      return { bg: Colors.coral, text: Colors.textOnNavy };
    case 'Medium':
      return { bg: Colors.chartBarAmber, text: Colors.textPrimary };
    default:
      return { bg: Colors.mint, text: Colors.textPrimary };
  }
}

export function UrgencyBadge({ level }: Props) {
  const c = colors(level);
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.text, { color: c.text }]}>{level}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  text: {
    ...Typography.caption,
    fontWeight: '600',
  },
});
