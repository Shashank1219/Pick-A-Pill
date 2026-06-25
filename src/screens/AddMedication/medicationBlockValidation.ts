import { Frequency, WeekdayCode } from '@/types';
import { isWeekdayFrequency } from '@/utils/weekdayHelpers';

export type MedicationBlockFieldErrors = Partial<
  Record<
    | 'medicationName'
    | 'dosageStrength'
    | 'customFrequencyDays'
    | 'selectedWeekdays'
    | 'reminderTime'
    | 'secondReminderTime',
    string
  >
>;

export interface MedicationBlockShape {
  medicationName: string;
  frequency: Frequency;
  customFrequencyDaysInput: string;
  selectedWeekdays: WeekdayCode[];
  secondReminderTime: string;
}

function parseCustomFrequencyDays(input: string): number | undefined {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }
  const parsed = parseInt(trimmed, 10);
  if (Number.isNaN(parsed)) {
    return undefined;
  }
  return parsed;
}

export function validateBlockFields(
  block: MedicationBlockShape,
): MedicationBlockFieldErrors {
  const errors: MedicationBlockFieldErrors = {};

  if (block.medicationName.trim().length < 1) {
    errors.medicationName = 'Medication name is required';
  }
  if (block.frequency === 'Custom') {
    const parsed = parseCustomFrequencyDays(block.customFrequencyDaysInput);
    if (parsed === undefined || parsed <= 0) {
      errors.customFrequencyDays = 'Enter number of days';
    }
  }
  if (
    isWeekdayFrequency(block.frequency) &&
    block.selectedWeekdays.length === 0
  ) {
    errors.selectedWeekdays = 'Select at least one day';
  }
  if (block.frequency === 'Twice Daily' && !block.secondReminderTime.trim()) {
    errors.secondReminderTime = 'Second reminder time is required';
  }

  return errors;
}
