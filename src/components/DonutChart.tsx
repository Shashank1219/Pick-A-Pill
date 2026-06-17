import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  taken: number;
  total: number;
  size: number;
}

export function DonutChart({ taken, total, size }: Props) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = total === 0 ? 0 : taken / total;
  const filledLength = circumference * ratio;
  const emptyLength = circumference - filledLength;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.2)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.mint}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${filledLength} ${emptyLength}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.ratio}>
          {taken}/{total}
        </Text>
        <Text style={styles.label}>doses</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  ratio: {
    ...Typography.bodySemiBold,
    color: Colors.textOnNavy,
  },
  label: {
    ...Typography.caption,
    color: Colors.textOnNavy,
  },
});
