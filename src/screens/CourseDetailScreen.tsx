import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MedicationDetailRow } from '@/components/MedicationDetailRow';
import { ProgressBar } from '@/components/ProgressBar';
import { cancelCourseReminders } from '@/services/notificationService';
import { useCourseStore } from '@/stores/useCourseStore';
import { useDoseStore } from '@/stores/useDoseStore';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { RootStackParamList } from '@/navigation/types';
import { computeCourseStatus } from '@/utils/courseHelpers';
import { formatDisplayDate } from '@/utils/dateHelpers';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetail'>;

export function CourseDetailScreen({ navigation, route }: Props) {
  const { courseId } = route.params;
  const course = useCourseStore(s => s.getCourseById(courseId));
  const deleteCourse = useCourseStore(s => s.deleteCourse);
  const deleteRecordsForCourse = useDoseStore(s => s.deleteRecordsForCourse);

  if (!course) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Course not found</Text>
      </View>
    );
  }

  const status = computeCourseStatus(course);

  const handleDelete = () => {
    Alert.alert(
      'Delete Course',
      'Are you sure you want to delete this course?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelCourseReminders(courseId);
            } catch (err) {
              console.error(
                'Failed to cancel notifications for deleted course:',
                err,
              );
            }
            deleteRecordsForCourse(courseId);
            deleteCourse(courseId);
            navigation.goBack();
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        activeOpacity={0.75}
        style={styles.back}>
        <Text style={styles.backText}>← Back</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{course.name}</Text>
      <Text style={styles.dateRange}>
        {formatDisplayDate(course.startDate)} –{' '}
        {formatDisplayDate(course.endDate)}
      </Text>
      <ProgressBar progress={status.progressRatio} style={styles.bar} />
      <Text style={styles.progressLabel}>
        {status.daysElapsed} of {course.durationDays} days completed
      </Text>

      <Text style={styles.sectionTitle}>Medications in this course</Text>
      {course.medications.map(med => (
        <MedicationDetailRow
          key={med.id}
          medication={med}
          onEdit={() =>
            navigation.navigate('AddMedicationFlow', {
              existingCourseId: courseId,
              editMedicationId: med.id,
            })
          }
        />
      ))}

      <TouchableOpacity
        style={styles.outlineButton}
        onPress={() =>
          navigation.navigate('AddMedicationFlow', {
            existingCourseId: courseId,
          })
        }
        activeOpacity={0.75}>
        <Text style={styles.outlineText}>Add Another Medication</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleDelete} activeOpacity={0.75}>
        <Text style={styles.delete}>Delete Course</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 48,
  },
  back: {
    marginTop: 48,
  },
  backText: {
    ...Typography.bodySemiBold,
    color: Colors.navy,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginTop: 12,
  },
  dateRange: {
    ...Typography.body,
    color: Colors.textMuted,
    marginTop: 4,
  },
  bar: {
    marginTop: 16,
  },
  progressLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 8,
  },
  sectionTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    marginTop: 24,
    marginBottom: 8,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: Colors.navy,
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  outlineText: {
    ...Typography.bodySemiBold,
    color: Colors.navy,
  },
  delete: {
    ...Typography.bodySemiBold,
    color: Colors.coral,
    textAlign: 'center',
    marginTop: 24,
  },
});
