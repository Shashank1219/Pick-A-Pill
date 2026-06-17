import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { DurationSelector } from '@/components/DurationSelector';
import { FormFactorSelector } from '@/components/FormFactorSelector';
import { FrequencyPicker } from '@/components/FrequencyPicker';
import { StepProgressBar } from '@/components/StepProgressBar';
import { TimePickerField } from '@/components/TimePickerField';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { AddMedicationStackParamList } from '@/navigation/types';
import { useFormContext } from './FormContext';

type Props = NativeStackScreenProps<AddMedicationStackParamList, 'StepOne'>;

export function StepOneScreen({ navigation, route }: Props) {
  const { existingCourseId } = route.params;
  const showCourseFields = !existingCourseId;

  const form = useFormContext();

  const handleNext = () => {
    if (form.validate(showCourseFields)) {
      navigation.navigate('StepTwo', route.params);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.getParent()?.goBack()}
          activeOpacity={0.75}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Add Medication</Text>
          <Text style={styles.subtitle}>Step 1 of 2 — Details</Text>
        </View>
      </View>
      <StepProgressBar currentStep={1} totalSteps={2} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {showCourseFields && (
          <View style={styles.field}>
            <Text style={styles.label}>
              COURSE NAME <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Antibiotic Run"
              placeholderTextColor={Colors.textMuted}
              value={form.courseName}
              onChangeText={form.setCourseName}
            />
            {form.errors.courseName ? (
              <Text style={styles.error}>{form.errors.courseName}</Text>
            ) : null}
          </View>
        )}

        <View style={styles.field}>
          <Text style={styles.label}>
            MEDICATION NAME <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Amoxicillin"
            placeholderTextColor={Colors.textMuted}
            value={form.medicationName}
            onChangeText={form.setMedicationName}
          />
          {form.errors.medicationName ? (
            <Text style={styles.error}>{form.errors.medicationName}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            DOSAGE STRENGTH <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 500mg"
            placeholderTextColor={Colors.textMuted}
            value={form.dosageStrength}
            onChangeText={form.setDosageStrength}
          />
          {form.errors.dosageStrength ? (
            <Text style={styles.error}>{form.errors.dosageStrength}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>FORM FACTOR</Text>
          <FormFactorSelector
            value={form.formFactor}
            onChange={form.setFormFactor}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>FREQUENCY</Text>
          <FrequencyPicker
            value={form.frequency}
            customDays={form.customFrequencyDays}
            onChange={(v, days) => {
              form.setFrequency(v);
              if (days !== undefined) {
                form.setCustomFrequencyDays(days);
              }
            }}
          />
          {form.errors.customFrequencyDays ? (
            <Text style={styles.error}>{form.errors.customFrequencyDays}</Text>
          ) : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            REMINDER TIME <Text style={styles.required}>*</Text>
          </Text>
          <TimePickerField
            value={form.reminderTime}
            onChange={form.setReminderTime}
          />
        </View>

        {showCourseFields && (
          <View style={styles.field}>
            <Text style={styles.label}>COURSE DURATION</Text>
            <DurationSelector
              value={form.durationDays}
              onChange={days => {
                form.setDurationDays(days);
                form.setCustomDurationDays(days);
              }}
            />
            {form.errors.customDurationDays ? (
              <Text style={styles.error}>{form.errors.customDurationDays}</Text>
            ) : null}
          </View>
        )}

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.75}>
          <Text style={styles.buttonText}>Next →</Text>
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
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  field: {
    marginTop: 20,
  },
  label: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  required: {
    color: Colors.coral,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginTop: 8,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  error: {
    ...Typography.caption,
    color: Colors.coral,
    marginTop: 4,
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
