import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Pencil } from 'lucide-react-native';

import { Medication } from '@/types';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { formatTime } from '@/utils/dateHelpers';

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
          {medication.dosageStrength} · {medication.formFactor} ·{' '}
          {medication.frequency} · {formatTime(medication.reminderTime)}
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
