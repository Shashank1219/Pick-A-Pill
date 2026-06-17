import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { Course, CourseStatus } from '@/types';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  course: Course;
  status: CourseStatus;
  onPress: () => void;
}

function urgencyDotColor(level: CourseStatus['urgency']): string {
  switch (level) {
    case 'High':
      return Colors.coral;
    case 'Medium':
      return Colors.chartBarAmber;
    default:
      return Colors.mint;
  }
}

export function CourseCard({ course, status, onPress }: Props) {
  const firstMed = course.medications[0];
  const label =
    course.medications.length > 1
      ? `${firstMed?.name ?? course.name} +${course.medications.length - 1} more`
      : (firstMed?.name ?? course.name);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={styles.topRow}>
        <View style={styles.nameRow}>
          <View
            style={[
              styles.dot,
              { backgroundColor: urgencyDotColor(status.urgency) },
            ]}
          />
          <Text style={styles.name}>{label}</Text>
          <UrgencyBadge level={status.urgency} />
        </View>
        <Text style={styles.daysLeft}>{status.daysLeft} days left</Text>
      </View>
      {firstMed && (
        <Text style={styles.dosage}>{firstMed.dosageStrength}</Text>
      )}
      <ProgressBar progress={status.progressRatio} style={styles.bar} />
      <Text style={styles.footer}>
        {status.daysElapsed} days completed · {course.durationDays} day course
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  daysLeft: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  dosage: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
    marginLeft: 16,
  },
  bar: {
    marginTop: 12,
  },
  footer: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 8,
  },
});
