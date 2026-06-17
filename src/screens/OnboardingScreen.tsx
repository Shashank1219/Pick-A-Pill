import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import notifee from '@notifee/react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { createNotificationChannel } from '@/services/notificationService';
import { setString } from '@/storage/mmkvStorage';
import { STORAGE_KEYS } from '@/storage/keys';
import { useProfileStore } from '@/stores/useProfileStore';
import { Colors } from '@/tokens/colors';
import { Typography } from '@/tokens/typography';
import { RootStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const setProfile = useProfileStore(s => s.setProfile);
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (name.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }
    setError('');
    setProfile({
      name: name.trim(),
      notificationsEnabled: true,
      refillReminderDays: 3,
      language: 'English',
    });
    setString(STORAGE_KEYS.ONBOARDED, 'true');
    await notifee.requestPermission();
    await createNotificationChannel();
    navigation.replace('App');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior="padding">
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled">
        <Svg width={80} height={40} viewBox="0 0 80 40">
          <Rect x={4} y={8} width={72} height={24} rx={12} fill={Colors.textOnNavy} />
        </Svg>
        <Text style={styles.title}>Pick-A-Pill</Text>
        <Text style={styles.tagline}>Your personal medication companion.</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Your name</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. John Doe"
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit}
          activeOpacity={0.75}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.navy,
  },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 48,
  },
  title: {
    ...Typography.display,
    color: Colors.textOnNavy,
    marginTop: 24,
  },
  tagline: {
    ...Typography.body,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    marginTop: 32,
  },
  label: {
    ...Typography.bodySemiBold,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    height: 48,
    paddingHorizontal: 16,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  error: {
    ...Typography.caption,
    color: Colors.coral,
    marginTop: 8,
  },
  button: {
    width: '100%',
    height: 56,
    backgroundColor: Colors.mint,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    ...Typography.bodySemiBold,
    color: Colors.navy,
  },
});
