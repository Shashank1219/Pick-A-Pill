import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  icon: string;
  value: string;
  label: string;
  iconColor: string;
}

export function StatCard({ icon, value, label, iconColor }: Props) {
  return (
    <View style={styles.card}>
      <Text style={[styles.icon, { color: iconColor }]}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
  },
  icon: {
    fontSize: 20,
    marginBottom: 8,
  },
  value: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
  },
  label: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
