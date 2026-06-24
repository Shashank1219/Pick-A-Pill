import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  InteractionManager,
  Keyboard,
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

export interface FrequencyPickerRef {
  focusCustomInput: () => void;
}

interface Props {
  value: Frequency;
  customDaysInput?: string;
  onChange: (v: Frequency, customDaysInput?: string) => void;
  onAfterSelect?: (frequency: Frequency) => void;
}

const OPTIONS: Frequency[] = [
  'Daily',
  'Twice Daily',
  'Alternate Days',
  'Weekly',
  'Monthly',
  'Custom',
];

export const FrequencyPicker = forwardRef<FrequencyPickerRef, Props>(
  function FrequencyPicker(
    { value, customDaysInput, onChange, onAfterSelect },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const customInputRef = useRef<TextInput>(null);

    useImperativeHandle(
      ref,
      () => ({
        focusCustomInput: () => customInputRef.current?.focus(),
      }),
      [],
    );

    const handleSelect = (item: Frequency) => {
      Keyboard.dismiss();
      onChange(
        item,
        item === 'Custom' ? customDaysInput ?? '2' : undefined,
      );
      setVisible(false);
      if (onAfterSelect) {
        InteractionManager.runAfterInteractions(() => {
          onAfterSelect(item);
        });
      }
    };

    return (
      <View>
        <TouchableOpacity
          style={styles.trigger}
          onPress={() => {
            Keyboard.dismiss();
            setVisible(true);
          }}
          activeOpacity={0.75}>
          <Text style={styles.triggerText}>{value}</Text>
          <ChevronDown size={20} color={Colors.textMuted} />
        </TouchableOpacity>
        {value === 'Custom' && (
          <View style={styles.customRow}>
            <Text style={styles.customLabel}>Every</Text>
            <TextInput
              ref={customInputRef}
              style={styles.customInput}
              keyboardType="number-pad"
              value={customDaysInput ?? ''}
              onChangeText={t => onChange('Custom', t)}
              placeholder="2"
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
                    onPress={() => handleSelect(item)}
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
  },
);

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
