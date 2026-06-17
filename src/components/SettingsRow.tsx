import React, { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  icon: ReactNode;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  isLast?: boolean;
}

export function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  isLast,
}: Props) {
  const content = (
    <>
      <View style={styles.left}>
        {icon}
        <Text style={styles.label}>{label}</Text>
      </View>
      <View style={styles.right}>
        {rightElement ?? (
          <>
            {value ? <Text style={styles.value}>{value}</Text> : null}
            {onPress && <ChevronRight size={18} color={Colors.textMuted} />}
          </>
        )}
      </View>
    </>
  );

  if (onPress && !rightElement) {
    return (
      <TouchableOpacity
        style={[styles.row, !isLast && styles.border]}
        onPress={onPress}
        activeOpacity={0.75}>
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.row, !isLast && styles.border]}>{content}</View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  border: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  value: {
    ...Typography.body,
    color: Colors.textMuted,
  },
});
