import { useCallback, useEffect, useState } from 'react';
import uuid from 'react-native-uuid';

import { useCourseStore } from '@/stores/useCourseStore';
import { FormFactor, Frequency, WeekdayCode } from '@/types';
import { addHoursToTime } from '@/utils/dateHelpers';
import {
  MedicationBlockFieldErrors,
  validateBlockFields,
} from '@/screens/AddMedication/medicationBlockValidation';

export type { MedicationBlockFieldErrors } from '@/screens/AddMedication/medicationBlockValidation';
export { validateBlockFields } from '@/screens/AddMedication/medicationBlockValidation';

export interface MedicationBlock {
  localId: string;
  medicationName: string;
  dosageStrength: string;
  formFactor: FormFactor;
  frequency: Frequency;
  customFrequencyDaysInput: string;
  selectedWeekdays: WeekdayCode[];
  reminderTime: string;
  secondReminderTime: string;
  isExpanded: boolean;
  errors: MedicationBlockFieldErrors;
}

function createEmptyBlock(expanded = true): MedicationBlock {
  return {
    localId: uuid.v4() as string,
    medicationName: '',
    dosageStrength: '',
    formFactor: 'Pill',
    frequency: 'Daily',
    customFrequencyDaysInput: '2',
    selectedWeekdays: [],
    reminderTime: '08:00',
    secondReminderTime: '',
    isExpanded: expanded,
    errors: {},
  };
}

export function useAddMedicationForm(
  existingCourseId?: string,
  editMedicationId?: string,
) {
  const getCourseById = useCourseStore(s => s.getCourseById);

  const skipStepOne = Boolean(existingCourseId);

  const [courseName, setCourseName] = useState('');
  const [durationDays, setDurationDays] = useState(7);
  const [customDurationDays, setCustomDurationDays] = useState(7);
  const [courseNameError, setCourseNameError] = useState<string | undefined>();
  const [durationError, setDurationError] = useState<string | undefined>();
  const [medicationBlocks, setMedicationBlocks] = useState<MedicationBlock[]>([
    createEmptyBlock(true),
  ]);

  useEffect(() => {
    if (!existingCourseId) {
      return;
    }
    const course = getCourseById(existingCourseId);
    if (!course) {
      return;
    }
    setCourseName(course.name);
    setDurationDays(course.durationDays);
    setCustomDurationDays(course.durationDays);

    if (editMedicationId) {
      const med = course.medications.find(m => m.id === editMedicationId);
      if (med) {
        setMedicationBlocks([
          {
            localId: uuid.v4() as string,
            medicationName: med.name,
            dosageStrength: med.dosageStrength,
            formFactor: med.formFactor,
            frequency: med.frequency,
            customFrequencyDaysInput: String(med.customFrequencyDays ?? 2),
            selectedWeekdays: med.selectedWeekdays ?? [],
            reminderTime: med.reminderTime,
            secondReminderTime:
              med.frequency === 'Twice Daily'
                ? med.secondReminderTime ??
                  addHoursToTime(med.reminderTime, 12)
                : '',
            isExpanded: true,
            errors: {},
          },
        ]);
      }
    }
  }, [editMedicationId, existingCourseId, getCourseById]);

  const effectiveDuration = durationDays || customDurationDays;

  const updateBlock = useCallback(
    (localId: string, partial: Partial<MedicationBlock>) => {
      setMedicationBlocks(prev =>
        prev.map(block =>
          block.localId === localId ? { ...block, ...partial } : block,
        ),
      );
    },
    [],
  );

  const validateBlock = useCallback((localId: string): boolean => {
    let valid = true;
    setMedicationBlocks(prev =>
      prev.map(block => {
        if (block.localId !== localId) {
          return block;
        }
        const errors = validateBlockFields(block);
        if (Object.keys(errors).length > 0) {
          valid = false;
        }
        return { ...block, errors, isExpanded: true };
      }),
    );
    return valid;
  }, []);

  const validateAllBlocks = useCallback((): boolean => {
    let valid = true;
    const next = medicationBlocks.map(block => {
      const errors = validateBlockFields(block);
      if (Object.keys(errors).length > 0) {
        valid = false;
        return { ...block, errors, isExpanded: true };
      }
      return { ...block, errors: {} };
    });
    setMedicationBlocks(next);
    return valid;
  }, [medicationBlocks]);

  const validateCourseName = useCallback((): boolean => {
    if (skipStepOne) {
      return true;
    }

    let valid = true;
    let nextCourseNameError: string | undefined;
    let nextDurationError: string | undefined;

    if (courseName.trim().length < 1) {
      nextCourseNameError = 'Course name is required';
      valid = false;
    }
    if (effectiveDuration <= 0) {
      nextDurationError = 'Enter a positive number of days';
      valid = false;
    }

    setCourseNameError(nextCourseNameError);
    setDurationError(nextDurationError);
    return valid;
  }, [courseName, effectiveDuration, skipStepOne]);

  const addBlock = useCallback((): boolean => {
    const expanded = medicationBlocks.find(b => b.isExpanded);
    if (expanded) {
      const errors = validateBlockFields(expanded);
      if (Object.keys(errors).length > 0) {
        setMedicationBlocks(prev =>
          prev.map(block =>
            block.localId === expanded.localId
              ? { ...block, errors, isExpanded: true }
              : block,
          ),
        );
        return false;
      }
    }

    setMedicationBlocks(prev => {
      const collapsed = prev.map(block =>
        block.isExpanded ? { ...block, isExpanded: false, errors: {} } : block,
      );
      return [...collapsed, createEmptyBlock(true)];
    });
    return true;
  }, [medicationBlocks]);

  const removeBlock = useCallback((localId: string) => {
    setMedicationBlocks(prev => {
      if (prev.length <= 1) {
        return prev;
      }
      return prev.filter(block => block.localId !== localId);
    });
  }, []);

  const expandBlock = useCallback((localId: string) => {
    setMedicationBlocks(prev =>
      prev.map(block => ({
        ...block,
        isExpanded: block.localId === localId,
      })),
    );
  }, []);

  const collapseBlock = useCallback((localId: string) => {
    updateBlock(localId, { isExpanded: false });
  }, [updateBlock]);

  const blockSummary = useCallback((block: MedicationBlock): string => {
    const name = block.medicationName.trim() || 'Unnamed';
    const dose = block.dosageStrength.trim() || '—';
    return `${name} · ${dose} · ${block.formFactor} ✓`;
  }, []);

  return {
    skipStepOne,
    courseName,
    setCourseName,
    durationDays,
    setDurationDays,
    customDurationDays,
    setCustomDurationDays,
    effectiveDuration,
    courseNameError,
    durationError,
    medicationBlocks,
    updateBlock,
    addBlock,
    removeBlock,
    expandBlock,
    collapseBlock,
    validateBlock,
    validateAllBlocks,
    validateCourseName,
    blockSummary,
    editMedicationId,
  };
}
