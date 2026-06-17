import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddMedicationStackParamList } from '@/navigation/types';
import { AddMedicationFormProvider } from '@/screens/AddMedication/FormContext';
import { StepOneScreen } from '@/screens/AddMedication/StepOneScreen';
import { StepTwoScreen } from '@/screens/AddMedication/StepTwoScreen';

const Stack = createNativeStackNavigator<AddMedicationStackParamList>();

interface Props {
  existingCourseId?: string;
  editMedicationId?: string;
}

export function AddMedicationFlowScreen({
  existingCourseId,
  editMedicationId,
}: Props) {
  return (
    <AddMedicationFormProvider
      existingCourseId={existingCourseId}
      editMedicationId={editMedicationId}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="StepOne"
          component={StepOneScreen}
          initialParams={{ existingCourseId, editMedicationId }}
        />
        <Stack.Screen
          name="StepTwo"
          component={StepTwoScreen}
          initialParams={{ existingCourseId, editMedicationId }}
        />
      </Stack.Navigator>
    </AddMedicationFormProvider>
  );
}
