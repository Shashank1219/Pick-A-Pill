import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  value: number;
  onChange: (days: number) => void;
}

const PRESETS = [7, 14, 30];

export function DurationSelector({ value, onChange }: Props) {
  const [isCustom, setIsCustom] = useState(
    !PRESETS.includes(value),
  );

  return (
    <View>
      <View style={styles.row}>
        {PRESETS.map(days => (
          <TouchableOpacity
            key={days}
            style={[
              styles.chip,
              !isCustom && value === days && styles.chipSelected,
            ]}
            onPress={() => {
              setIsCustom(false);
              onChange(days);
            }}
            activeOpacity={0.75}>
            <Text
              style={[
                styles.chipText,
                !isCustom && value === days && styles.chipTextSelected,
              ]}>
              {days} days
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          style={[styles.chip, isCustom && styles.chipSelected]}
          onPress={() => setIsCustom(true)}
          activeOpacity={0.75}>
          <Text style={[styles.chipText, isCustom && styles.chipTextSelected]}>
            Custom
          </Text>
        </TouchableOpacity>
      </View>
      {isCustom && (
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          placeholder="Number of days"
          placeholderTextColor={Colors.textMuted}
          value={isCustom ? String(value) : ''}
          onChangeText={t => onChange(parseInt(t, 10) || 0)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  chip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: Colors.navy,
  },
  chipText: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
    fontSize: 12,
  },
  chipTextSelected: {
    color: Colors.textOnNavy,
  },
  input: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginTop: 8,
    ...Typography.body,
    color: Colors.textPrimary,
  },
});
