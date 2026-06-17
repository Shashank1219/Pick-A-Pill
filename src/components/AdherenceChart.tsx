import React, { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

import { WeekDay } from '@/types';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  weekDays: WeekDay[];
}

function barColor(pct: number): string {
  if (pct === 100) {
    return Colors.chartBarMint;
  }
  if (pct >= 50) {
    return Colors.chartBarNavy;
  }
  if (pct >= 1) {
    return Colors.chartBarAmber;
  }
  return Colors.progressBg;
}

export function AdherenceChart({ weekDays }: Props) {
  const [chartWidth, setChartWidth] = useState(0);
  const maxHeight = 120;
  const gap = 8;
  const barWidth =
    chartWidth > 0 ? (chartWidth - gap * 6) / 7 : 0;

  const onLayout = (e: LayoutChangeEvent) => {
    setChartWidth(e.nativeEvent.layout.width - 40);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>7-Day Adherence</Text>
      <View style={styles.chartRow} onLayout={onLayout}>
        <View style={styles.yAxis}>
          {[100, 75, 50, 25, 0].map(v => (
            <Text key={v} style={styles.yLabel}>
              {v}%
            </Text>
          ))}
        </View>
        <View style={styles.barsWrap}>
          <Svg width={chartWidth} height={maxHeight + 24}>
            {weekDays.map((day, i) => {
              const barH = (day.adherencePct / 100) * maxHeight;
              const x = i * (barWidth + gap);
              const y = maxHeight - barH;
              return (
                <Rect
                  key={day.date}
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barH}
                  fill={barColor(day.adherencePct)}
                  rx={4}
                />
              );
            })}
          </Svg>
          <View style={styles.xLabels}>
            {weekDays.map(day => (
              <Text key={day.date} style={styles.xLabel}>
                {day.dayLabel}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  chartRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
  yAxis: {
    width: 36,
    height: 120,
    justifyContent: 'space-between',
    marginRight: 4,
  },
  yLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'right',
  },
  barsWrap: {
    flex: 1,
  },
  xLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  xLabel: {
    ...Typography.caption,
    color: Colors.textMuted,
    flex: 1,
    textAlign: 'center',
  },
});
