import { useCallback, useEffect, useState } from 'react';

import { useCourseStore } from '@/stores/useCourseStore';
import { FormFactor, Frequency } from '@/types';

export interface FormErrors {
  courseName?: string;
  medicationName?: string;
  dosageStrength?: string;
  customFrequencyDays?: string;
  customDurationDays?: string;
}

export function useAddMedicationForm(
  existingCourseId?: string,
  editMedicationId?: string,
) {
  const getCourseById = useCourseStore(s => s.getCourseById);

  const [courseName, setCourseName] = useState('');
  const [medicationName, setMedicationName] = useState('');
  const [dosageStrength, setDosageStrength] = useState('');
  const [formFactor, setFormFactor] = useState<FormFactor>('Pill');
  const [frequency, setFrequency] = useState<Frequency>('Daily');
  const [customFrequencyDays, setCustomFrequencyDays] = useState<number>(2);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [durationDays, setDurationDays] = useState(7);
  const [customDurationDays, setCustomDurationDays] = useState(7);
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!editMedicationId || !existingCourseId) {
      return;
    }
    const course = getCourseById(existingCourseId);
    const med = course?.medications.find(m => m.id === editMedicationId);
    if (!med || !course) {
      return;
    }
    setCourseName(course.name);
    setMedicationName(med.name);
    setDosageStrength(med.dosageStrength);
    setFormFactor(med.formFactor);
    setFrequency(med.frequency);
    setCustomFrequencyDays(med.customFrequencyDays ?? 2);
    setReminderTime(med.reminderTime);
    setDurationDays(course.durationDays);
    setCustomDurationDays(course.durationDays);
  }, [editMedicationId, existingCourseId, getCourseById]);

  const effectiveDuration = durationDays || customDurationDays;

  const validate = useCallback(
    (includeCourseFields: boolean): boolean => {
      const next: FormErrors = {};

      if (includeCourseFields && courseName.trim().length < 1) {
        next.courseName = 'Course name is required';
      }
      if (medicationName.trim().length < 1) {
        next.medicationName = 'Medication name is required';
      }
      if (dosageStrength.trim().length < 1) {
        next.dosageStrength = 'Dosage strength is required';
      }
      if (frequency === 'Custom' && (!customFrequencyDays || customFrequencyDays <= 0)) {
        next.customFrequencyDays = 'Enter a positive number of days';
      }
      if (includeCourseFields && effectiveDuration <= 0) {
        next.customDurationDays = 'Enter a positive number of days';
      }

      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [
      courseName,
      medicationName,
      dosageStrength,
      frequency,
      customFrequencyDays,
      effectiveDuration,
    ],
  );

  return {
    courseName,
    setCourseName,
    medicationName,
    setMedicationName,
    dosageStrength,
    setDosageStrength,
    formFactor,
    setFormFactor,
    frequency,
    setFrequency,
    customFrequencyDays,
    setCustomFrequencyDays,
    reminderTime,
    setReminderTime,
    durationDays,
    setDurationDays,
    customDurationDays,
    setCustomDurationDays,
    effectiveDuration,
    errors,
    validate,
  };
}
