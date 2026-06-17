import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { Frequency } from '@/types';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';

interface Props {
  value: Frequency;
  customDays?: number;
  onChange: (v: Frequency, days?: number) => void;
}

const OPTIONS: Frequency[] = [
  'Daily',
  'Twice Daily',
  'Alternate Days',
  'Weekly',
  'Monthly',
  'Custom',
];

export function FrequencyPicker({ value, customDays, onChange }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        activeOpacity={0.75}>
        <Text style={styles.triggerText}>{value}</Text>
        <ChevronDown size={20} color={Colors.textMuted} />
      </TouchableOpacity>
      {value === 'Custom' && (
        <View style={styles.customRow}>
          <Text style={styles.customLabel}>Every</Text>
          <TextInput
            style={styles.customInput}
            keyboardType="number-pad"
            value={customDays?.toString() ?? ''}
            onChangeText={t =>
              onChange('Custom', t ? parseInt(t, 10) : undefined)
            }
            placeholder="days"
            placeholderTextColor={Colors.textMuted}
          />
          <Text style={styles.customLabel}>days</Text>
        </View>
      )}
      <Modal visible={visible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}>
          <View style={styles.modal}>
            <FlatList
              data={OPTIONS}
              keyExtractor={item => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onChange(item, item === 'Custom' ? customDays : undefined);
                    setVisible(false);
                  }}
                  activeOpacity={0.75}>
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.card,
    borderRadius: 12,
    height: 52,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  triggerText: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  customLabel: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  customInput: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    height: 44,
    width: 80,
    paddingHorizontal: 12,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modal: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    maxHeight: 360,
  },
  option: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  optionText: {
    ...Typography.body,
    color: Colors.textPrimary,
  },
});
