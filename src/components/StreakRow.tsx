import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { WeekDay } from '@/types';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  weekDays: WeekDay[];
  streakCount: number;
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function StreakRow({ weekDays, streakCount }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>This Week's Streak</Text>
        <View style={styles.streakPill}>
          <Text style={styles.flame}>🔥</Text>
          <Text style={styles.streakText}>{streakCount} days</Text>
        </View>
      </View>
      <View style={styles.row}>
        {weekDays.map((day, index) => (
          <View key={day.date} style={styles.dayCol}>
            <View style={[styles.circle, circleStyle(day.status)]}>
              {day.status === 'full' && (
                <Check size={16} color={Colors.textOnNavy} />
              )}
              {day.status === 'missed' && (
                <Text style={styles.dash}>–</Text>
              )}
              {day.status === 'partial' && (
                <Text style={styles.partial}>~</Text>
              )}
              {day.status === 'future' && <View style={styles.todayDot} />}
            </View>
            <Text style={styles.dayLabel}>
              {DAY_LABELS[index] ?? day.dayLabel.charAt(0)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function circleStyle(status: WeekDay['status']) {
  switch (status) {
    case 'full':
      return { backgroundColor: Colors.streakFilled };
    case 'missed':
      return { backgroundColor: Colors.streakMissed };
    case 'partial':
      return { backgroundColor: Colors.chartBarNavy };
    default:
      return {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: Colors.mint,
      };
  }
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.coral,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 4,
  },
  flame: {
    fontSize: 14,
  },
  streakText: {
    ...Typography.caption,
    color: Colors.textOnNavy,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  dayCol: {
    alignItems: 'center',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dash: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  partial: {
    ...Typography.bodySemiBold,
    color: Colors.textOnNavy,
  },
  todayDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.mint,
  },
  dayLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 6,
  },
});
