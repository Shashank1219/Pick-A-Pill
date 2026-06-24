import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { WeekdayCode } from '@/types';
import { WEEKDAY_CODES } from '@/utils/weekdayHelpers';

interface Props {
  selected: WeekdayCode[];
  onChange: (days: WeekdayCode[]) => void;
  error?: string;
}

export function WeekdaySelector({ selected, onChange, error }: Props) {
  const toggle = (day: WeekdayCode) => {
    if (selected.includes(day)) {
      onChange(selected.filter(d => d !== day));
    } else {
      onChange([...selected, day]);
    }
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        {WEEKDAY_CODES.map(day => {
          const isSelected = selected.includes(day);
          return (
            <TouchableOpacity
              key={day}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => toggle(day)}
              activeOpacity={0.75}>
              <Text
                style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    minWidth: 40,
    height: 36,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.navy,
  },
  chipText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  chipTextSelected: {
    color: Colors.textOnNavy,
  },
  error: {
    ...Typography.caption,
    color: Colors.coral,
    marginTop: 4,
  },
});
