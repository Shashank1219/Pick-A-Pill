import {
  validateBlockFields,
  MedicationBlockShape,
} from '@/screens/AddMedication/medicationBlockValidation';

function makeBlock(partial: Partial<MedicationBlockShape> = {}): MedicationBlockShape {
  return {
    medicationName: 'Aspirin',
    frequency: 'Daily',
    customFrequencyDaysInput: '2',
    selectedWeekdays: [],
    secondReminderTime: '',
    ...partial,
  };
}

describe('validateBlockFields', () => {
  it('requires medication name', () => {
    const errors = validateBlockFields(makeBlock({ medicationName: '' }));
    expect(errors.medicationName).toBe('Medication name is required');
  });

  it('requires weekday selection for Weekly frequency', () => {
    const errors = validateBlockFields(
      makeBlock({ frequency: 'Weekly', selectedWeekdays: [] }),
    );
    expect(errors.selectedWeekdays).toBe('Select at least one day');
  });

  it('returns no errors for a valid block', () => {
    const errors = validateBlockFields(
      makeBlock({
        frequency: 'Weekly',
        selectedWeekdays: ['Mon'],
      }),
    );
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('returns multiple errors simultaneously', () => {
    const errors = validateBlockFields(
      makeBlock({
        medicationName: '',
        frequency: 'Custom',
        customFrequencyDaysInput: '0',
      }),
    );
    expect(errors.medicationName).toBeDefined();
    expect(errors.customFrequencyDays).toBeDefined();
  });
});
