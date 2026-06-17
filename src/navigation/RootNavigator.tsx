import React, { useMemo } from 'react';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';

import { getString } from '@/storage/mmkvStorage';
import { STORAGE_KEYS } from '@/storage/keys';
import { AppNavigator } from '@/navigation/AppNavigator';
import { RootStackParamList } from '@/navigation/types';
import { AddMedicationFlowScreen } from '@/screens/AddMedication/AddMedicationFlowScreen';
import { CourseDetailScreen } from '@/screens/CourseDetailScreen';
import { EditProfileScreen } from '@/screens/EditProfileScreen';
import { OnboardingScreen } from '@/screens/OnboardingScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

function AddMedicationFlowRoute({
  route,
}: NativeStackScreenProps<RootStackParamList, 'AddMedicationFlow'>) {
  return (
    <AddMedicationFlowScreen
      existingCourseId={route.params?.existingCourseId}
      editMedicationId={route.params?.editMedicationId}
    />
  );
}

export function RootNavigator() {
  const isOnboarded = useMemo(
    () => getString(STORAGE_KEYS.ONBOARDED) === 'true',
    [],
  );

  return (
    <Stack.Navigator
      initialRouteName={isOnboarded ? 'App' : 'Onboarding'}
      screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="App" component={AppNavigator} />
      <Stack.Group screenOptions={{ presentation: 'modal' }}>
        <Stack.Screen
          name="AddMedicationFlow"
          component={AddMedicationFlowRoute}
        />
        <Stack.Screen name="CourseDetail" component={CourseDetailScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      </Stack.Group>
    </Stack.Navigator>
  );
}
