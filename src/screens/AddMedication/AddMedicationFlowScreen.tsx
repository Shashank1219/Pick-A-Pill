import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { AddMedicationStackParamList } from '@/navigation/types';
import { AddMedicationFormProvider } from '@/screens/AddMedication/FormContext';
import { StepOneScreen } from '@/screens/AddMedication/StepOneScreen';
import { StepThreeScreen } from '@/screens/AddMedication/StepThreeScreen';
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
  const initialRoute = existingCourseId ? 'StepTwo' : 'StepOne';
  const screenParams = { existingCourseId, editMedicationId };

  return (
    <AddMedicationFormProvider
      existingCourseId={existingCourseId}
      editMedicationId={editMedicationId}>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="StepOne"
          component={StepOneScreen}
          initialParams={screenParams}
        />
        <Stack.Screen
          name="StepTwo"
          component={StepTwoScreen}
          initialParams={screenParams}
        />
        <Stack.Screen
          name="StepThree"
          component={StepThreeScreen}
          initialParams={screenParams}
        />
      </Stack.Navigator>
    </AddMedicationFormProvider>
  );
}
