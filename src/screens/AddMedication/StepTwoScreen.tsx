import React from 'react';
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { MedicationBlockCard } from '@/components/MedicationBlockCard';
import { StepProgressBar } from '@/components/StepProgressBar';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { AddMedicationStackParamList } from '@/navigation/types';
import { dismissParentOrCurrent } from '@/navigation/navigationHelpers';
import { useFormContext } from './FormContext';

type Props = NativeStackScreenProps<AddMedicationStackParamList, 'StepTwo'>;

export function StepTwoScreen({ navigation, route }: Props) {
  const form = useFormContext();

  const stepLabel = form.skipStepOne
    ? 'Step 1 of 2 — Medication'
    : 'Step 2 of 3 — Medication';
  const progressStep = form.skipStepOne ? 1 : 2;
  const progressTotal = form.skipStepOne ? 2 : 3;

  const handleNext = () => {
    if (form.validateAllBlocks()) {
      navigation.navigate('StepThree', route.params);
    }
  };

  const handleAddAnother = () => {
    form.addBlock();
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (form.skipStepOne) {
              dismissParentOrCurrent(navigation);
            } else {
              navigation.goBack();
            }
          }}
          activeOpacity={0.75}>
          <Text style={styles.back}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Add Medication</Text>
          <Text style={styles.subtitle}>{stepLabel}</Text>
        </View>
      </View>
      <StepProgressBar currentStep={progressStep} totalSteps={progressTotal} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        {form.medicationBlocks.map((block, index) => (
          <MedicationBlockCard
            key={block.localId}
            block={block}
            index={index}
            canRemove={form.medicationBlocks.length > 1}
            summary={form.blockSummary(block)}
            onUpdate={partial => form.updateBlock(block.localId, partial)}
            onExpand={() => form.expandBlock(block.localId)}
            onRemove={() => form.removeBlock(block.localId)}
          />
        ))}

        <TouchableOpacity
          onPress={handleAddAnother}
          activeOpacity={0.75}
          style={styles.addAnother}>
          <Text style={styles.addAnotherText}>+ Add Another Medication</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.75}>
          <Text style={styles.buttonText}>Next →</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    gap: 12,
  },
  back: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  addAnother: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
  },
  addAnotherText: {
    ...Typography.bodySemiBold,
    color: Colors.mint,
  },
  button: {
    height: 56,
    backgroundColor: Colors.mint,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    ...Typography.bodySemiBold,
    color: Colors.navy,
  },
});
