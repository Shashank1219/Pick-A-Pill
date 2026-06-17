import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { DoseStatus } from '@/types';
import { Colors } from '@/tokens/colors';

interface Props {
  status: DoseStatus;
  onToggle: () => void;
}

export function StatusCircle({ status, onToggle }: Props) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.75}
      style={[
        styles.circle,
        status === 'taken' && styles.taken,
        status === 'missed' && styles.missed,
        status === 'pending' && styles.pending,
      ]}>
      {status === 'taken' && <Check size={16} color={Colors.textOnNavy} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taken: {
    backgroundColor: Colors.mint,
  },
  missed: {
    borderWidth: 2,
    borderColor: Colors.coral,
    backgroundColor: 'transparent',
  },
  pending: {
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: 'transparent',
  },
});
