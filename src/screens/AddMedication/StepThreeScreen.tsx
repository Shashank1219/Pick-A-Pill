import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  ToastAndroid,
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
import { dismissParentOrCurrent } from '@/navigation/navigationHelpers';
import { Course, Medication } from '@/types';
import {
  addDaysToDateString,
  formatDisplayDate,
  formatTime,
  todayString,
} from '@/utils/dateHelpers';
import { CardShadow } from '@/tokens/elevation';
import { isWeekdayFrequency, formatFrequencyDisplay } from '@/utils/weekdayHelpers';
import { useFormContext } from './FormContext';
import { MedicationBlock } from '@/screens/AddMedication/useAddMedicationForm';

type Props = NativeStackScreenProps<AddMedicationStackParamList, 'StepThree'>;

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

function blocksToMedications(
  blocks: MedicationBlock[],
  editMedicationId?: string,
): Medication[] {
  return blocks.map((block, index) => ({
    id:
      editMedicationId && index === 0
        ? editMedicationId
        : (uuid.v4() as string),
    name: block.medicationName.trim(),
    dosageStrength: block.dosageStrength.trim(),
    formFactor: block.formFactor,
    frequency: block.frequency,
    customFrequencyDays:
      block.frequency === 'Custom'
        ? parseInt(block.customFrequencyDaysInput.trim(), 10)
        : undefined,
    selectedWeekdays: isWeekdayFrequency(block.frequency)
      ? block.selectedWeekdays
      : undefined,
    reminderTime: block.reminderTime,
    ...(block.frequency === 'Twice Daily'
      ? { secondReminderTime: block.secondReminderTime }
      : {}),
  }));
}

export function StepThreeScreen({ navigation, route }: Props) {
  const { existingCourseId } = route.params;
  const form = useFormContext();

  const addCourse = useCourseStore(s => s.addCourse);
  const addMedicationsToCourse = useCourseStore(s => s.addMedicationsToCourse);
  const updateMedicationInCourse = useCourseStore(s => s.updateMedicationInCourse);
  const getCourseById = useCourseStore(s => s.getCourseById);

  const startDate = todayString();
  const endDate = addDaysToDateString(startDate, form.effectiveDuration - 1);

  const stepLabel = form.skipStepOne
    ? 'Step 2 of 2 — Confirm'
    : 'Step 3 of 3 — Confirm';
  const progressStep = form.skipStepOne ? 2 : 3;
  const progressTotal = form.skipStepOne ? 2 : 3;

  const scheduleReminders = async (
    meds: Medication[],
    course: Course,
  ): Promise<void> => {
    try {
      for (const medication of meds) {
        await scheduleMedicationReminder(medication, course);
      }
    } catch (err) {
      console.error('Notification scheduling failed:', err);
      ToastAndroid.show(
        'Course saved, but reminders could not be scheduled.',
        ToastAndroid.LONG,
      );
    }
  };

  const handleConfirm = async () => {
    const medications = blocksToMedications(
      form.medicationBlocks,
      form.editMedicationId,
    );

    try {
      if (form.editMedicationId && existingCourseId) {
        updateMedicationInCourse(
          existingCourseId,
          form.editMedicationId,
          medications[0],
        );
        const course = getCourseById(existingCourseId);
        if (course) {
          await scheduleReminders([medications[0]], course);
        }
      } else if (existingCourseId) {
        addMedicationsToCourse(existingCourseId, medications);
        const course = getCourseById(existingCourseId);
        if (course) {
          await scheduleReminders(medications, course);
        }
      } else {
        const course: Course = {
          id: uuid.v4() as string,
          name: form.courseName.trim(),
          startDate,
          durationDays: form.effectiveDuration,
          endDate,
          medications,
        };
        addCourse(course);
        await scheduleReminders(medications, course);
      }
    } finally {
      dismissParentOrCurrent(navigation);
    }
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
          <Text style={styles.subtitle}>{stepLabel}</Text>
        </View>
      </View>
      <StepProgressBar currentStep={progressStep} totalSteps={progressTotal} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, CardShadow]}>
          <Text style={styles.cardTitle}>Review your course</Text>

          {!existingCourseId && (
            <>
              <SummaryRow label="Course" value={form.courseName} />
              <SummaryRow
                label="Duration"
                value={`${form.effectiveDuration} days`}
              />
              <SummaryRow
                label="Start Date"
                value={`Today (${formatDisplayDate(startDate)})`}
              />
              <SummaryRow
                label="End Date"
                value={formatDisplayDate(endDate)}
              />
            </>
          )}

          {existingCourseId && (
            <SummaryRow
              label="Course"
              value={getCourseById(existingCourseId)?.name ?? ''}
            />
          )}
        </View>

        {form.medicationBlocks.map((block, index) => (
          <View key={block.localId} style={[styles.card, CardShadow]}>
            <Text style={styles.medHeader}>
              Medication {index + 1}: {block.medicationName.trim()}
            </Text>
            <SummaryRow
              label="Dosage"
              value={block.dosageStrength.trim() || '—'}
            />
            <SummaryRow label="Form" value={block.formFactor} />
            <SummaryRow
              label="Frequency"
              value={formatFrequencyDisplay(
                block.frequency,
                block.selectedWeekdays,
              )}
            />
            <SummaryRow
              label="Reminder"
              value={
                block.frequency === 'Twice Daily'
                  ? `${formatTime(block.reminderTime)}, ${formatTime(block.secondReminderTime)}`
                  : formatTime(block.reminderTime)
              }
              isLast
            />
          </View>
        ))}

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
  medHeader: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 12,
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
