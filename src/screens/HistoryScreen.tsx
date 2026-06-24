import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { AdherenceChart } from '@/components/AdherenceChart';
import { StatCard } from '@/components/StatCard';
import { StreakRow } from '@/components/StreakRow';
import { useCourseStore } from '@/stores/useCourseStore';
import { useDoseStore } from '@/stores/useDoseStore';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { TabParamList } from '@/navigation/types';
import { computeAdherenceStats } from '@/utils/courseHelpers';

type Props = BottomTabScreenProps<TabParamList, 'History'>;

export function HistoryScreen(_props: Props) {
  const courses = useCourseStore(s => s.courses);
  const records = useDoseStore(s => s.records);

  const stats = useMemo(
    () => computeAdherenceStats(courses, records),
    [courses, records],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
      <Text style={styles.title}>Course History</Text>
      <Text style={styles.subtitle}>Your medication adherence overview</Text>

      <View style={styles.statsRow}>
        <StatCard
          icon="🔥"
          value={String(stats.dayStreak)}
          label="Day Streak"
          iconColor={Colors.coral}
        />
        <StatCard
          icon="📈"
          value={`${stats.avgAdherencePct}%`}
          label="Avg. Adherence"
          iconColor={Colors.mint}
        />
        <StatCard
          icon="⏱"
          value={String(stats.activeCourseCount)}
          label="Active Courses"
          iconColor={Colors.navy}
        />
      </View>

      <View style={styles.block}>
        <StreakRow
          weekDays={stats.weeklyAdherence}
          streakCount={stats.dayStreak}
        />
      </View>

      <View style={styles.block}>
        <AdherenceChart weekDays={stats.weeklyAdherence} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    paddingBottom: 100,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginTop: 48,
    paddingHorizontal: 20,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textMuted,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
    paddingHorizontal: 20,
  },
  block: {
    marginTop: 20,
    marginHorizontal: 20,
  },
});
