import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

import { CourseCard } from '@/components/CourseCard';
import { useCourseStore } from '@/stores/useCourseStore';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { RootStackParamList, TabParamList } from '@/navigation/types';
import { computeCourseStatus } from '@/utils/courseHelpers';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Home'>,
  NativeStackScreenProps<RootStackParamList>
>;

export function HomeScreen({ navigation }: Props) {
  const courses = useCourseStore(s => s.courses);

  const activeCourses = useMemo(
    () => courses.filter(c => computeCourseStatus(c).isActive),
    [courses],
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}>
      <Text style={styles.title}>My Courses</Text>
      <Text style={styles.subtitle}>Tap a course to view details</Text>

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
