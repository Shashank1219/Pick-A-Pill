import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  title: string;
  doneCount: number;
  totalCount: number;
}

export function SectionHeader({ title, doneCount, totalCount }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.count}>
        {doneCount}/{totalCount} done
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
  },
  count: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
