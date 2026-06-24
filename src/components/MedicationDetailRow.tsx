import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Pencil } from 'lucide-react-native';

import { Medication } from '@/types';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { formatTime } from '@/utils/dateHelpers';
import { formatFrequencyDisplay } from '@/utils/weekdayHelpers';

function formatReminderTimes(medication: Medication): string {
  if (medication.frequency === 'Twice Daily' && medication.secondReminderTime) {
    return `${formatTime(medication.reminderTime)}, ${formatTime(medication.secondReminderTime)}`;
  }
  return formatTime(medication.reminderTime);
}

interface Props {
  medication: Medication;
  onEdit: () => void;
}

export function MedicationDetailRow({ medication, onEdit }: Props) {
  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{medication.name}</Text>
        <Text style={styles.detail}>
          {medication.dosageStrength || '—'} · {medication.formFactor} ·{' '}
          {formatFrequencyDisplay(
            medication.frequency,
            medication.selectedWeekdays,
          )}{' '}
          · {formatReminderTimes(medication)}
        </Text>
      </View>
      <TouchableOpacity onPress={onEdit} activeOpacity={0.75}>
        <Pencil size={20} color={Colors.navy} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  info: {
    flex: 1,
  },
  name: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  detail: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 4,
  },
});
