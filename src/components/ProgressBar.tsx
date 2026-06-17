import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';

import { Colors } from '@/tokens/colors';

interface Props {
  progress: number;
  height?: number;
  fillColor?: string;
  trackColor?: string;
  style?: ViewStyle;
}

export function ProgressBar({
  progress,
  height = 4,
  fillColor = Colors.mint,
  trackColor = Colors.progressBg,
  style,
}: Props) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View
      style={[
        styles.track,
        { height, borderRadius: height / 2, backgroundColor: trackColor },
        style,
      ]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height: '100%',
          backgroundColor: fillColor,
          borderRadius: height / 2,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
});
