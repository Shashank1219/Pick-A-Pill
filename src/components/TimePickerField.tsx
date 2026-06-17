import React, { useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { format, parse } from 'date-fns';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { formatTime } from '@/utils/dateHelpers';

interface Props {
  value: string;
  onChange: (hhmm: string) => void;
}

function toDate(hhmm: string): Date {
  return parse(hhmm, 'HH:mm', new Date());
}

export function TimePickerField({ value, onChange }: Props) {
  const [show, setShow] = useState(false);

  const onPickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }
    if (date) {
      onChange(format(date, 'HH:mm'));
    }
  };

  return (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={() => setShow(true)}
        activeOpacity={0.75}>
        <Clock size={20} color={Colors.navy} />
        <Text style={styles.text}>{formatTime(value)}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={toDate(value)}
          mode="time"
          is24Hour={false}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginTop: 8,
    gap: 12,
  },
  text: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
});
