import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { AdherenceChart } from '@/components/AdherenceChart';
import { CourseCard } from '@/components/CourseCard';
import { StatCard } from '@/components/StatCard';
import { StreakRow } from '@/components/StreakRow';
import { useCourseStore } from '@/stores/useCourseStore';
import { useDoseStore } from '@/stores/useDoseStore';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { RootStackParamList, TabParamList } from '@/navigation/types';
import { computeAdherenceStats, computeCourseStatus } from '@/utils/courseHelpers';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Dashboard'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function DashboardScreen({ navigation }: Props) {
  const courses = useCourseStore(s => s.courses);
  const getActiveCourses = useCourseStore(s => s.getActiveCourses);
  const records = useDoseStore(s => s.records);

  const stats = useMemo(
    () => computeAdherenceStats(courses, records),
    [courses, records],
  );

  const activeCourses = getActiveCourses();

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

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Active Courses</Text>
        <TouchableOpacity activeOpacity={0.75}>
          <Text style={styles.seeAll}>See all</Text>
        </TouchableOpacity>
      </View>

      {activeCourses.length === 0 ? (
        <Text style={styles.empty}>No courses yet. Tap + to begin.</Text>
      ) : (
        activeCourses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            status={computeCourseStatus(course)}
            onPress={() =>
              navigation.navigate('CourseDetail', { courseId: course.id })
            }
          />
        ))
      )}
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
  },
  seeAll: {
    ...Typography.bodySemiBold,
    color: Colors.mint,
  },
  empty: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 20,
  },
});
