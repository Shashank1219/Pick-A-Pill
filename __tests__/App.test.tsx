/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';

jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/navigation/RootNavigator', () => ({
  RootNavigator: () => null,
}));

jest.mock('@/services/notificationService', () => ({
  ensureNotificationChannelReady: jest.fn(() => Promise.resolve()),
  rescheduleAllActiveReminders: jest.fn(() => Promise.resolve()),
}));

jest.mock('@/stores/useCourseStore', () => ({
  useCourseStore: {
    getState: jest.fn(() => ({ courses: [] })),
  },
}));

jest.mock('@/stores/useProfileStore', () => ({
  useProfileStore: {
    getState: jest.fn(() => ({ profile: null })),
  },
}));

import App from '../App';

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
