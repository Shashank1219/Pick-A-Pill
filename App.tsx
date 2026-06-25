import React, { useEffect, useMemo, useState } from 'react';
import { StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { RootNavigator } from '@/navigation/RootNavigator';
import {
  ensureNotificationChannelReady,
  rescheduleAllActiveReminders,
} from '@/services/notificationService';
import { useCourseStore } from '@/stores/useCourseStore';
import { useProfileStore } from '@/stores/useProfileStore';

function App() {
  useEffect(() => {
    const init = async () => {
      await ensureNotificationChannelReady();
      const profile = useProfileStore.getState().profile;
      if (profile?.notificationsEnabled !== false) {
        const courses = useCourseStore.getState().courses;
        await rescheduleAllActiveReminders(courses);
      }
    };
    init().catch(err => console.error('App init failed:', err));
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" />
      <ErrorBoundary>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

export default App;
