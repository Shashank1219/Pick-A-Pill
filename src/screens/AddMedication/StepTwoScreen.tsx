import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import uuid from 'react-native-uuid';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { StepProgressBar } from '@/components/StepProgressBar';
import { scheduleMedicationReminder } from '@/services/notificationService';
import { useCourseStore } from '@/stores/useCourseStore';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { AddMedicationStackParamList } from '@/navigation/types';
import { Course, Medication } from '@/types';
import {
  addDaysToDateString,
  formatDisplayDate,
  formatTime,
  todayString,
} from '@/utils/dateHelpers';
import { useFormContext } from './FormContext';

type Props = NativeStackScreenProps<AddMedicationStackParamList, 'StepTwo'>;

function SummaryRow({
  label,
  value,
  isLast,
}: {
  label: string;
  value: string;
  isLast?: boolean;
}) {
  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export function StepTwoScreen({ navigation, route }: Props) {
  const { existingCourseId, editMedicationId } = route.params;
  const form = useFormContext();

  const addCourse = useCourseStore(s => s.addCourse);
  const addMedicationToCourse = useCourseStore(s => s.addMedicationToCourse);
  const updateMedicationInCourse = useCourseStore(s => s.updateMedicationInCourse);
  const getCourseById = useCourseStore(s => s.getCourseById);

  const startDate = todayString();
  const endDate = addDaysToDateString(startDate, form.effectiveDuration - 1);

  const handleConfirm = async () => {
    const medication: Medication = {
      id: editMedicationId ?? (uuid.v4() as string),
      name: form.medicationName.trim(),
      dosageStrength: form.dosageStrength.trim(),
      formFactor: form.formFactor,
      frequency: form.frequency,
      customFrequencyDays:
        form.frequency === 'Custom' ? form.customFrequencyDays : undefined,
      reminderTime: form.reminderTime,
    };

    if (editMedicationId && existingCourseId) {
      updateMedicationInCourse(existingCourseId, editMedicationId, medication);
      const course = getCourseById(existingCourseId);
      if (course) {
        await scheduleMedicationReminder(medication, course);
      }
    } else if (existingCourseId) {
      addMedicationToCourse(existingCourseId, medication);
      const course = getCourseById(existingCourseId);
      if (course) {
        await scheduleMedicationReminder(medication, course);
      }
    } else {
      const course: Course = {
        id: uuid.v4() as string,
        name: form.courseName.trim(),
        startDate,
        durationDays: form.effectiveDuration,
        endDate,
        medications: [medication],
      };
      addCourse(course);
      await scheduleMedicationReminder(medication, course);
    }

    navigation.getParent()?.goBack();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Add Medication</Text>
          <Text style={styles.subtitle}>Step 2 of 2 — Confirm</Text>
        </View>
      </View>
      <StepProgressBar currentStep={2} totalSteps={2} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Review your medication</Text>
          <SummaryRow label="Medication" value={form.medicationName} />
          <SummaryRow label="Dosage" value={form.dosageStrength} />
          <SummaryRow label="Form" value={form.formFactor} />
          <SummaryRow label="Frequency" value={form.frequency} />
          <SummaryRow label="Reminder" value={formatTime(form.reminderTime)} />
          {!existingCourseId && (
            <>
              <SummaryRow
                label="Duration"
                value={`${form.effectiveDuration} days`}
              />
              <SummaryRow label="Course" value={form.courseName} />
            </>
          )}
          <SummaryRow
            label="Start Date"
            value={`Today (${formatDisplayDate(startDate)})`}
          />
          {!existingCourseId && (
            <SummaryRow
              label="End Date"
              value={formatDisplayDate(endDate)}
              isLast
            />
          )}
          {existingCourseId && (
            <SummaryRow label="Course" value={getCourseById(existingCourseId)?.name ?? ''} isLast />
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.75}>
          <Text style={styles.editLink}>← Edit Details</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirm}
          activeOpacity={0.75}>
          <Text style={styles.buttonText}>Confirm & Save</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    gap: 12,
  },
  back: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  cardTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  row: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  rowValue: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  editLink: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 16,
  },
  button: {
    height: 56,
    backgroundColor: Colors.mint,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  buttonText: {
    ...Typography.bodySemiBold,
    color: Colors.navy,
  },
});
