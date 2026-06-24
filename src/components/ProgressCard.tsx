import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { DonutChart } from '@/components/DonutChart';
import { ProgressBar } from '@/components/ProgressBar';
import { Colors } from '@/tokens/colors';
import { CardShadowElevated, CardSurfaceClip } from '@/tokens/elevation';
import { Typography } from '@/tokens/typography';

interface Props {
  taken: number;
  total: number;
}

export function ProgressCard({ taken, total }: Props) {
  const pct = total === 0 ? 0 : Math.round((taken / total) * 100);

  return (
    <View style={[styles.card, CardShadowElevated, CardSurfaceClip]}>
      <View style={styles.topRow}>
        <View style={styles.left}>
          <Text style={styles.label}>TODAY'S PROGRESS</Text>
          <Text style={styles.pct}>{pct}%</Text>
          <Text style={styles.subtitle}>
            {taken} of {total} doses taken
          </Text>
          {taken < total && (
            <View style={styles.nudge}>
              <Text style={styles.nudgeText}>Don't forget your doses</Text>
            </View>
          )}
        </View>
        <DonutChart taken={taken} total={total} size={80} />
      </View>
      <ProgressBar
        progress={total === 0 ? 0 : taken / total}
        fillColor={Colors.coral}
        trackColor="rgba(255,255,255,0.3)"
        style={styles.bar}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.navy,
    borderRadius: 20,
    padding: 20,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  label: {
    ...Typography.label,
    color: 'rgba(255,255,255,0.7)',
  },
  pct: {
    ...Typography.stat,
    color: Colors.textOnNavy,
    marginTop: 4,
  },
  subtitle: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  nudge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 8,
  },
  nudgeText: {
    ...Typography.caption,
    color: Colors.textOnNavy,
  },
  bar: {
    marginTop: 16,
  },
});
