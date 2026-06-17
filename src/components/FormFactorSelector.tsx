import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Droplet, Link, Syringe } from 'lucide-react-native';

import { FormFactor } from '@/types';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  value: FormFactor;
  onChange: (v: FormFactor) => void;
}

const OPTIONS: FormFactor[] = ['Pill', 'Liquid', 'Injection'];

function Icon({ type, selected }: { type: FormFactor; selected: boolean }) {
  const color = selected ? Colors.textOnNavy : Colors.textPrimary;
  const size = 24;
  switch (type) {
    case 'Liquid':
      return <Droplet size={size} color={color} />;
    case 'Injection':
      return <Syringe size={size} color={color} />;
    default:
      return <Link size={size} color={color} />;
  }
}

export function FormFactorSelector({ value, onChange }: Props) {
  return (
    <View style={styles.row}>
      {OPTIONS.map(option => {
        const selected = value === option;
        return (
          <TouchableOpacity
            key={option}
            style={[styles.chip, selected && styles.chipSelected]}
            onPress={() => onChange(option)}
            activeOpacity={0.75}>
            <Icon type={option} selected={selected} />
            <Text style={[styles.label, selected && styles.labelSelected]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  chip: {
    flex: 1,
    height: 64,
    borderRadius: 12,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  chipSelected: {
    backgroundColor: Colors.navy,
  },
  label: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  labelSelected: {
    color: Colors.textOnNavy,
  },
});
