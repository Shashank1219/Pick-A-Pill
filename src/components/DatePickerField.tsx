import React, { useCallback, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { format, parse, startOfDay } from 'date-fns';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { formatDisplayDate, todayString } from '@/utils/dateHelpers';

interface Props {
  value: string;
  onChange: (dateStr: string) => void;
}

function toPickerDate(dateStr: string): Date {
  return startOfDay(parse(dateStr, 'yyyy-MM-dd', new Date()));
}

export function DatePickerField({ value, onChange }: Props) {
  const [showIosPicker, setShowIosPicker] = useState(false);
  const minimumDate = useMemo(() => startOfDay(new Date()), []);

  const pickerValue = useMemo(() => {
    const parsed = toPickerDate(value);
    return parsed < minimumDate ? minimumDate : parsed;
  }, [minimumDate, value]);

  const applyDate = useCallback(
    (date: Date) => {
      onChange(format(date, 'yyyy-MM-dd'));
    },
    [onChange],
  );

  const openPicker = useCallback(() => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: pickerValue,
        mode: 'date',
        minimumDate,
        onValueChange: (_event, date) => {
          applyDate(date);
        },
      });
      return;
    }
    setShowIosPicker(true);
  }, [applyDate, minimumDate, pickerValue]);

  const onIosPickerChange = (_event: DateTimePickerEvent, date?: Date) => {
    setShowIosPicker(false);
    if (date) {
      applyDate(date);
    }
  };

  const displayLabel =
    value === todayString()
      ? `Today (${formatDisplayDate(value)})`
      : formatDisplayDate(value);

  return (
    <View>
      <TouchableOpacity
        style={styles.row}
        onPress={openPicker}
        activeOpacity={0.75}>
        <Calendar size={20} color={Colors.navy} />
        <Text style={styles.text}>{displayLabel}</Text>
      </TouchableOpacity>
      {Platform.OS === 'ios' && showIosPicker && (
        <DateTimePicker
          value={pickerValue}
          mode="date"
          display="spinner"
          minimumDate={minimumDate}
          onChange={onIosPickerChange}
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
