import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/tokens/colors';

interface Props {
  currentStep: number;
  totalSteps: number;
}

export function StepProgressBar({ currentStep, totalSteps }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }).map((_, index) => (
        <View
          key={index}
          style={[
            styles.segment,
            index < currentStep ? styles.active : styles.inactive,
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 12,
    marginHorizontal: 20,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
  active: {
    backgroundColor: Colors.mint,
  },
  inactive: {
    backgroundColor: Colors.progressBg,
  },
});
