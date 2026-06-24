import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ProgressBar } from '@/components/ProgressBar';
import { UrgencyBadge } from '@/components/UrgencyBadge';
import { Course, CourseStatus } from '@/types';
import { Colors } from '@/tokens/colors';
import { CardShadow, CardSurfaceClip } from '@/tokens/elevation';
import { Typography } from '@/tokens/typography';

interface Props {
  course: Course;
  status: CourseStatus;
  onPress: () => void;
  showUrgency?: boolean;
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

function medicationSummary(course: Course): string | undefined {
  if (course.medications.length === 0) {
    return undefined;
  }
  const firstMed = course.medications[0];
  if (course.medications.length > 1) {
    return `${firstMed.name} +${course.medications.length - 1} more`;
  }
  return firstMed.name;
}

export function CourseCard({
  course,
  status,
  onPress,
  showUrgency = false,
}: Props) {
  const firstMed = course.medications[0];
  const summary = medicationSummary(course);

  return (
    <TouchableOpacity
      style={[styles.card, CardShadow, CardSurfaceClip]}
      onPress={onPress}
      activeOpacity={0.75}>
      <View style={styles.topRow}>
        <View style={styles.nameRow}>
          {showUrgency && (
            <View
              style={[
                styles.dot,
                { backgroundColor: urgencyDotColor(status.urgency) },
              ]}
            />
          )}
          <Text style={styles.name}>{course.name}</Text>
          {showUrgency && <UrgencyBadge level={status.urgency} />}
        </View>
        <Text style={styles.daysLeft}>{status.daysLeft} days left</Text>
      </View>
      {summary ? <Text style={styles.medSummary}>{summary}</Text> : null}
      {firstMed?.dosageStrength ? (
        <Text style={styles.dosage}>{firstMed.dosageStrength}</Text>
      ) : null}
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
    marginHorizontal: 20,
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
  medSummary: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
  daysLeft: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  dosage: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
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
