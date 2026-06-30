import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';
import {
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerAndroid,
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Clock } from 'lucide-react-native';
import { format, parse } from 'date-fns';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { formatTime } from '@/utils/dateHelpers';

export interface TimePickerFieldRef {
  open: () => void;
}

interface Props {
  value: string;
  onChange: (hhmm: string) => void;
}

function toDate(hhmm: string): Date {
  return parse(hhmm, 'HH:mm', new Date());
}

export const TimePickerField = forwardRef<TimePickerFieldRef, Props>(
  function TimePickerField({ value, onChange }, ref) {
    const [showIosPicker, setShowIosPicker] = useState(false);
    const pickerValue = useMemo(() => toDate(value), [value]);

    const applyTime = useCallback(
      (date: Date) => {
        onChange(format(date, 'HH:mm'));
        Keyboard.dismiss();
      },
      [onChange],
    );

    const openPicker = useCallback(() => {
      Keyboard.dismiss();

      if (Platform.OS === 'android') {
        DateTimePickerAndroid.open({
          value: pickerValue,
          mode: 'time',
          is24Hour: false,
          onValueChange: (_event, date) => {
            applyTime(date);
          },
        });
        return;
      }

      setShowIosPicker(true);
    }, [applyTime, pickerValue]);

    useImperativeHandle(ref, () => ({ open: openPicker }), [openPicker]);

    const onIosPickerChange = (_event: DateTimePickerEvent, date?: Date) => {
      setShowIosPicker(false);
      if (date) {
        applyTime(date);
      }
    };

    return (
      <View>
        <TouchableOpacity
          style={styles.row}
          onPress={openPicker}
          activeOpacity={0.75}>
          <Clock size={20} color={Colors.navy} />
          <Text style={styles.text}>{formatTime(value)}</Text>
        </TouchableOpacity>
        {Platform.OS === 'ios' && showIosPicker && (
          <DateTimePicker
            value={pickerValue}
            mode="time"
            is24Hour={false}
            display="spinner"
            onChange={onIosPickerChange}
          />
        )}
      </View>
    );
  },
);

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
