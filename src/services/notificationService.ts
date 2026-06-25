import notifee, {
  AndroidImportance,
  AndroidVisibility,
  RepeatFrequency,
  TimestampTrigger,
  TriggerType,
} from '@notifee/react-native';

import { useCourseStore } from '@/stores/useCourseStore';
import { useProfileStore } from '@/stores/useProfileStore';
import { Course, Medication, WeekdayCode } from '@/types';
import { addHoursToTime } from '@/utils/dateHelpers';
import { computeCourseStatus } from '@/utils/courseHelpers';
import { todayString } from '@/utils/dateHelpers';
import {
  isWeekdayFrequency,
  weekdayCodeToIndex,
} from '@/utils/weekdayHelpers';

const CHANNEL_ID = 'medication-reminders';

let channelReadyPromise: Promise<void> | null = null;

async function setupNotificationChannel(): Promise<void> {
  await notifee.createChannel({
    id: CHANNEL_ID,
    name: 'Medication Reminders',
    importance: AndroidImportance.HIGH,
  });
}

export function ensureNotificationChannelReady(): Promise<void> {
  if (channelReadyPromise === null) {
    channelReadyPromise = setupNotificationChannel();
  }
  return channelReadyPromise;
}

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

function buildWeeklyTrigger(
  weekdayIndex: number,
  hhmm: string,
): TimestampTrigger {
  const { hour, minute } = parseTimeParts(hhmm);
  const now = new Date();
  const triggerDate = new Date();
  triggerDate.setHours(hour, minute, 0, 0);

  const currentDay = triggerDate.getDay();
  let daysUntil = (weekdayIndex - currentDay + 7) % 7;
  if (daysUntil === 0 && triggerDate.getTime() <= now.getTime()) {
    daysUntil = 7;
  }
  triggerDate.setDate(triggerDate.getDate() + daysUntil);

  return {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerDate.getTime(),
    repeatFrequency: RepeatFrequency.WEEKLY,
  };
}

async function scheduleSingleReminder(
  notificationId: string,
  medication: Medication,
  course: Course,
  hhmm: string,
  trigger: TimestampTrigger,
): Promise<void> {
  if (computeCourseStatus(course).isCompleted) {
    return;
  }

  await notifee.createTriggerNotification(
    {
      id: notificationId,
      title: `Time for your ${medication.name}`,
      body: `${medication.dosageStrength || '—'} · ${medication.formFactor}`,
      data: {
        medicationId: medication.id,
        courseId: course.id,
      },
      android: {
        channelId: CHANNEL_ID,
        pressAction: { id: 'default' },
        visibility: AndroidVisibility.PRIVATE,
      },
    },
    trigger,
  );
}

async function scheduleDailySlot(
  notificationId: string,
  medication: Medication,
  course: Course,
  hhmm: string,
): Promise<void> {
  await scheduleSingleReminder(
    notificationId,
    medication,
    course,
    hhmm,
    buildDailyTrigger(hhmm),
  );
}

async function scheduleWeekdaySlots(
  medication: Medication,
  course: Course,
  hhmm: string,
  idSuffix: string,
  weekdays: WeekdayCode[],
): Promise<void> {
  for (const day of weekdays) {
    const notificationId = `med_${medication.id}_${day}${idSuffix}`;
    await scheduleSingleReminder(
      notificationId,
      medication,
      course,
      hhmm,
      buildWeeklyTrigger(weekdayCodeToIndex(day), hhmm),
    );
  }
}

export async function createNotificationChannel(): Promise<void> {
  return ensureNotificationChannelReady();
}

export async function scheduleMedicationReminder(
  medication: Medication,
  course: Course,
): Promise<void> {
  await ensureNotificationChannelReady();

  const profile = useProfileStore.getState().profile;
  if (profile && !profile.notificationsEnabled) {
    return;
  }

  if (course.endDate < todayString()) {
    return;
  }

  if (isWeekdayFrequency(medication.frequency)) {
    const weekdays = medication.selectedWeekdays ?? [];
    if (weekdays.length === 0) {
      return;
    }
    await scheduleWeekdaySlots(medication, course, medication.reminderTime, '', weekdays);
    return;
  }

  await scheduleDailySlot(
    `med_${medication.id}`,
    medication,
    course,
    medication.reminderTime,
  );

  if (medication.frequency === 'Twice Daily') {
    const slot2Time =
      medication.secondReminderTime ??
      addHoursToTime(medication.reminderTime, 12);
    await scheduleDailySlot(
      `med_${medication.id}_slot2`,
      medication,
      course,
      slot2Time,
    );
  }
}

export async function cancelMedicationReminders(
  medication: Medication,
): Promise<void> {
  await ensureNotificationChannelReady();

  const baseId = `med_${medication.id}`;

  if (isWeekdayFrequency(medication.frequency)) {
    const weekdays = medication.selectedWeekdays ?? [];
    for (const day of weekdays) {
      await notifee.cancelNotification(`${baseId}_${day}`);
    }
    return;
  }

  await notifee.cancelNotification(baseId);

  if (medication.frequency === 'Twice Daily') {
    await notifee.cancelNotification(`${baseId}_slot2`);
  }
}

export async function cancelCourseReminders(courseId: string): Promise<void> {
  const course = useCourseStore.getState().getCourseById(courseId);
  if (!course) {
    return;
  }
  for (const medication of course.medications) {
    await cancelMedicationReminders(medication);
  }
}

export async function rescheduleAllActiveReminders(
  courses: Course[],
): Promise<void> {
  await ensureNotificationChannelReady();

  const activeCourses = courses.filter(c => computeCourseStatus(c).isActive);
  for (const course of activeCourses) {
    for (const medication of course.medications) {
      await scheduleMedicationReminder(medication, course);
    }
  }
}
