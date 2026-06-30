import React, { useCallback, useRef } from 'react';
import {
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';

import { FormFactorSelector } from '@/components/FormFactorSelector';
import {
  FrequencyPicker,
  FrequencyPickerRef,
} from '@/components/FrequencyPicker';
import {
  TimePickerField,
  TimePickerFieldRef,
} from '@/components/TimePickerField';
import { WeekdaySelector } from '@/components/WeekdaySelector';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { FormFactor, Frequency } from '@/types';
import { addHoursToTime } from '@/utils/dateHelpers';
import { isWeekdayFrequency } from '@/utils/weekdayHelpers';
import { CardShadow } from '@/tokens/elevation';

import { MedicationBlock } from '@/screens/AddMedication/useAddMedicationForm';

interface Props {
  block: MedicationBlock;
  index: number;
  canRemove: boolean;
  summary: string;
  onUpdate: (partial: Partial<MedicationBlock>) => void;
  onExpand: () => void;
  onRemove: () => void;
}

export function MedicationBlockCard({
  block,
  index,
  canRemove,
  summary,
  onUpdate,
  onExpand,
  onRemove,
}: Props) {
  const medicationNameRef = useRef<TextInput>(null);
  const dosageStrengthRef = useRef<TextInput>(null);
  const frequencyPickerRef = useRef<FrequencyPickerRef>(null);
  const reminderTimeRef = useRef<TimePickerFieldRef>(null);

  const dismissTextFocus = useCallback(() => {
    Keyboard.dismiss();
    medicationNameRef.current?.blur();
    dosageStrengthRef.current?.blur();
  }, []);

  const focusNextAfterFrequency = useCallback(
    (frequency: Frequency) => {
      dismissTextFocus();
      if (frequency === 'Custom') {
        frequencyPickerRef.current?.focusCustomInput();
      } else if (frequency === 'Weekly') {
        // Next field is chip-based; keyboard stays dismissed.
      } else {
        reminderTimeRef.current?.open();
      }
    },
    [dismissTextFocus],
  );

  const handleFormFactorChange = useCallback(
    (v: FormFactor) => {
      dismissTextFocus();
      onUpdate({ formFactor: v });
    },
    [dismissTextFocus, onUpdate],
  );

  const handleFrequencyChange = useCallback(
    (v: Frequency, customDaysInput?: string) => {
      const updates: Partial<MedicationBlock> = {
        frequency: v,
        ...(customDaysInput !== undefined
          ? { customFrequencyDaysInput: customDaysInput }
          : {}),
      };
      if (v === 'Twice Daily' && block.frequency !== 'Twice Daily') {
        updates.secondReminderTime = addHoursToTime(block.reminderTime, 12);
      } else if (v !== 'Twice Daily') {
        updates.secondReminderTime = '';
      }
      if (!isWeekdayFrequency(v)) {
        updates.selectedWeekdays = [];
      }
      onUpdate(updates);
    },
    [block.frequency, block.reminderTime, onUpdate],
  );

  if (!block.isExpanded) {
    return (
      <TouchableOpacity
        style={[styles.collapsed, CardShadow]}
        onPress={onExpand}
        activeOpacity={0.75}>
        <Text style={styles.collapsedText}>{summary}</Text>
        {canRemove && (
          <TouchableOpacity
            onPress={onRemove}
            hitSlop={8}
            activeOpacity={0.75}>
            <X size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.card, CardShadow]}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Medication {index + 1}</Text>
        {canRemove && (
          <TouchableOpacity onPress={onRemove} activeOpacity={0.75}>
            <Text style={styles.remove}>Remove</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          MEDICATION NAME <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          ref={medicationNameRef}
          style={styles.input}
          placeholder="e.g., Amoxicillin"
          placeholderTextColor={Colors.textMuted}
          value={block.medicationName}
          onChangeText={v => onUpdate({ medicationName: v })}
          returnKeyType="next"
          blurOnSubmit={false}
          onSubmitEditing={() => dosageStrengthRef.current?.focus()}
        />
        {block.errors.medicationName ? (
          <Text style={styles.error}>{block.errors.medicationName}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>DOSAGE STRENGTH</Text>
        <TextInput
          ref={dosageStrengthRef}
          style={styles.input}
          placeholder="e.g., 500"
          placeholderTextColor={Colors.textMuted}
          keyboardType="number-pad"
          value={block.dosageStrength}
          onChangeText={v => onUpdate({ dosageStrength: v })}
          returnKeyType="done"
          onSubmitEditing={Keyboard.dismiss}
        />
        {block.errors.dosageStrength ? (
          <Text style={styles.error}>{block.errors.dosageStrength}</Text>
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>FORM FACTOR</Text>
        <FormFactorSelector
          value={block.formFactor}
          onChange={handleFormFactorChange}
        />
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>FREQUENCY</Text>
        <FrequencyPicker
          ref={frequencyPickerRef}
          value={block.frequency}
          customDaysInput={block.customFrequencyDaysInput}
          onChange={handleFrequencyChange}
          onAfterSelect={focusNextAfterFrequency}
        />
        {block.errors.customFrequencyDays ? (
          <Text style={styles.error}>{block.errors.customFrequencyDays}</Text>
        ) : null}
        {isWeekdayFrequency(block.frequency) ? (
          <WeekdaySelector
            selected={block.selectedWeekdays}
            onChange={days => onUpdate({ selectedWeekdays: days })}
            error={block.errors.selectedWeekdays}
          />
        ) : null}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>
          {block.frequency === 'Twice Daily'
            ? 'FIRST REMINDER TIME'
            : 'REMINDER TIME'}{' '}
          <Text style={styles.required}>*</Text>
        </Text>
        <TimePickerField
          ref={reminderTimeRef}
          value={block.reminderTime}
          onChange={v => {
            dismissTextFocus();
            onUpdate({ reminderTime: v });
          }}
        />
      </View>

      {block.frequency === 'Twice Daily' ? (
        <View style={styles.field}>
          <Text style={styles.label}>
            SECOND REMINDER TIME <Text style={styles.required}>*</Text>
          </Text>
          <TimePickerField
            value={block.secondReminderTime}
            onChange={v => {
              dismissTextFocus();
              onUpdate({ secondReminderTime: v });
            }}
          />
          {block.errors.secondReminderTime ? (
            <Text style={styles.error}>{block.errors.secondReminderTime}</Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginTop: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    ...Typography.sectionTitle,
    color: Colors.textPrimary,
  },
  remove: {
    ...Typography.caption,
    color: Colors.coral,
  },
  collapsed: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  collapsedText: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  field: {
    marginTop: 16,
  },
  label: {
    ...Typography.label,
    color: Colors.textMuted,
  },
  required: {
    color: Colors.coral,
  },
  input: {
    backgroundColor: Colors.surface,
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
});
