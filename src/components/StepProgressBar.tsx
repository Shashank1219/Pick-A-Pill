import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Colors } from '@/tokens/colors';

interface Props {
  currentStep: number;
  totalSteps: number;
  skippedFirstStep?: boolean;
}

export function StepProgressBar({
  currentStep,
  totalSteps,
  skippedFirstStep = false,
}: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const stepNumber = index + 1;
        const isComplete =
          stepNumber < currentStep ||
          (skippedFirstStep && stepNumber === 1);
        const isActive = stepNumber === currentStep;

        return (
          <View
            key={index}
            style={[
              styles.segment,
              isComplete || isActive ? styles.active : styles.inactive,
            ]}
          />
        );
      })}
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
