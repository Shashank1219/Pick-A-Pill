import React, { useState } from 'react';
import {
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  ToastAndroid,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bell, Globe, Pill } from 'lucide-react-native';
import { CompositeScreenProps } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { SettingsRow } from '@/components/SettingsRow';
import {
  cancelCourseReminders,
  rescheduleAllActiveReminders,
} from '@/services/notificationService';
import { useCourseStore } from '@/stores/useCourseStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { Colors } from '@/tokens/colors';
import { CardShadow, CardShadowElevated, CardSurfaceClip } from '@/tokens/elevation';
import { Typography } from '@/tokens/typography';
import { RootStackParamList, TabParamList } from '@/navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

const REFILL_OPTIONS = [1, 2, 3, 5, 7];

function showToast(message: string) {
  ToastAndroid.show(message, ToastAndroid.SHORT);
}

export function SettingsScreen({ navigation }: Props) {
  const profile = useProfileStore(s => s.profile);
  const updateProfile = useProfileStore(s => s.updateProfile);
  const courses = useCourseStore(s => s.courses);
  const getActiveCourses = useCourseStore(s => s.getActiveCourses);

  const [refillPickerVisible, setRefillPickerVisible] = useState(false);

  const notificationsOn = profile?.notificationsEnabled ?? true;
  const refillDays = profile?.refillReminderDays ?? 3;

  const toggleNotifications = async (value: boolean) => {
    updateProfile({ notificationsEnabled: value });
    const active = getActiveCourses();
    if (value) {
      await rescheduleAllActiveReminders(courses);
    } else {
      for (const course of active) {
        await cancelCourseReminders(course.id);
      }
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      <View style={[styles.profileCard, CardShadowElevated, CardSurfaceClip]}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.name ?? 'User'}</Text>
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
            activeOpacity={0.75}>
            <Text style={styles.editText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.listCard, CardShadow, CardSurfaceClip]}>
        <SettingsRow
          icon={<Bell size={20} color={Colors.chartBarAmber} />}
          label="Notifications"
          rightElement={
            <Switch
              value={notificationsOn}
              onValueChange={toggleNotifications}
              trackColor={{ true: Colors.mint, false: Colors.border }}
            />
          }
        />
        <SettingsRow
          icon={<Pill size={20} color={Colors.coral} />}
          label="Refill Reminders"
          value={`${refillDays} days before`}
          onPress={() => setRefillPickerVisible(true)}
        />
        <SettingsRow
          icon={<Globe size={20} color={Colors.navy} />}
          label="Language"
          value={profile?.language ?? 'English'}
          onPress={() => showToast('Coming soon')}
          isLast
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.version}>Pick-A-Pill v2.4.1</Text>
        <TouchableOpacity
          onPress={() => Linking.openURL('https://example.com/privacy')}
          activeOpacity={0.75}>
          <Text style={styles.privacy}>Privacy Policy</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={refillPickerVisible} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setRefillPickerVisible(false)}>
          <View style={styles.modalSheet}>
            {REFILL_OPTIONS.map(days => (
              <TouchableOpacity
                key={days}
                style={styles.modalOption}
                onPress={() => {
                  updateProfile({ refillReminderDays: days });
                  setRefillPickerVisible(false);
                }}
                activeOpacity={0.75}>
                <Text style={styles.modalOptionText}>{days} days before</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.surface,
  },
  content: {
    paddingBottom: 48,
  },
  title: {
    ...Typography.title,
    color: Colors.textPrimary,
    marginTop: 48,
    paddingHorizontal: 20,
  },
  profileCard: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: Colors.navy,
    padding: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  profileName: {
    ...Typography.bodySemiBold,
    color: Colors.textOnNavy,
  },
  editButton: {
    borderWidth: 1,
    borderColor: Colors.textOnNavy,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  editText: {
    ...Typography.caption,
    color: Colors.textOnNavy,
    fontWeight: '600',
  },
  listCard: {
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 16,
    backgroundColor: Colors.card,
  },
  footer: {
    marginTop: 32,
    marginBottom: 48,
    alignItems: 'center',
    gap: 8,
  },
  version: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  privacy: {
    ...Typography.caption,
    color: Colors.mint,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 32,
  },
  modalOption: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalOptionText: {
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
});
