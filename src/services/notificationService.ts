import notifee, {
  AndroidImportance,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import { useCourseStore } from '@/stores/useCourseStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { Course, Medication } from '@/types';
import { addHoursToTime } from '@/utils/dateHelpers';
import { computeCourseStatus } from '@/utils/courseHelpers';
import { todayString } from '@/utils/dateHelpers';

const CHANNEL_ID = 'medication-reminders';

function parseTimeParts(hhmm: string): { hour: number; minute: number } {
  const [hour, minute] = hhmm.split(':').map(Number);
  return { hour, minute };
}

function buildDailyTrigger(hhmm: string): TimestampTrigger {
  const { hour, minute } = parseTimeParts(hhmm);
  const now = new Date();
  const triggerDate = new Date();
  triggerDate.setHours(hour, minute, 0, 0);
  if (triggerDate.getTime() <= now.getTime()) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  return {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerDate.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
  };
}

async function scheduleSingleReminder(
  notificationId: string,
  medication: Medication,
  course: Course,
  hhmm: string,
): Promise<void> {
  if (computeCourseStatus(course).isCompleted) {
    return;
  }

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title: `Time for your ${medication.name}`,
      body: `${medication.dosageStrength} · ${medication.formFactor}`,
      data: {
        medicationId: medication.id,
        courseId: course.id,
      },
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
      },
    },
    buildDailyTrigger(hhmm),
  );
}

export async function createNotificationChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Medication Reminders',
    importance: AndroidImportance.HIGH,
  });
}

export async function scheduleMedicationReminder(
  medication: Medication,
  course: Course,
): Promise<void> {
  const profile = useProfileStore.getState().profile;
  if (profile && !profile.notificationsEnabled) {
    return;
  }

  if (course.endDate < todayString()) {
    return;
  }

  await scheduleSingleReminder(
    `med_${medication.id}`,
    medication,
    course,
    medication.reminderTime,
  );

  if (medication.frequency === 'Twice Daily') {
    const slot2Time = addHoursToTime(medication.reminderTime, 12);
    await scheduleSingleReminder(
      `med_${medication.id}_slot2`,
      medication,
      course,
      slot2Time,
    );
  }
}

export async function cancelMedicationReminders(
  medicationId: string,
): Promise<void> {
  await notifee.cancelNotification(`med_${medicationId}`);
  await notifee.cancelNotification(`med_${medicationId}_slot2`);
}

export async function cancelCourseReminders(courseId: string): Promise<void> {
  const course = useCourseStore.getState().getCourseById(courseId);
  if (!course) {
    return;
  }
  for (const medication of course.medications) {
    await cancelMedicationReminders(medication.id);
  }
}

export async function rescheduleAllActiveReminders(
  courses: Course[],
): Promise<void> {
  const activeCourses = courses.filter(c => computeCourseStatus(c).isActive);
  for (const course of activeCourses) {
    for (const medication of course.medications) {
      await scheduleMedicationReminder(medication, course);
    }
  }
}
