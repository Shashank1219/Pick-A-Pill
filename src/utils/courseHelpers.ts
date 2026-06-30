import { format, endOfMonth, parseISO, subDays } from 'date-fns';

import {
  AdherenceStats,
  Course,
  CourseStatus,
  DoseRecord,
  DoseStatus,
  Medication,
  UrgencyLevel,
  WeekDay,
} from '@/types';

import {
  addDaysToDateString,
  addHoursToTime,
  diffInDays,
  isDateInCourseRange,
  parseTimeToMinutes,
  todayString,
} from './dateHelpers';
import { weekdayCodeFromDate } from './weekdayHelpers';

export function getTimeOfDay(
  reminderTime: string,
): 'morning' | 'afternoon' | 'evening' {
  const [hours] = reminderTime.split(':').map(Number);
  if (hours < 12) {
    return 'morning';
  }
  if (hours < 17) {
    return 'afternoon';
  }
  return 'evening';
}

export function isDoseScheduledOnDate(
  medication: Medication,
  course: Course,
  date: string,
): boolean {
  if (!isDateInCourseRange(date, course.startDate, course.endDate)) {
    return false;
  }

  const daysSinceStart = diffInDays(course.startDate, date);

  switch (medication.frequency) {
    case 'Daily':
    case 'Twice Daily':
      return true;

    case 'Alternate Days':
      return daysSinceStart % 2 === 0;

    case 'Weekly': {
      const weekdays = medication.selectedWeekdays ?? [];
      if (weekdays.length === 0) {
        return false;
      }
      const code = weekdayCodeFromDate(date);
      return weekdays.includes(code);
    }

    case 'Monthly': {
      const startDate = parseISO(course.startDate);
      const targetDate = parseISO(date);
      const startDay = startDate.getDate();
      const lastDayOfTargetMonth = endOfMonth(targetDate).getDate();
      const effectiveDay = Math.min(startDay, lastDayOfTargetMonth);
      return targetDate.getDate() === effectiveDay;
    }

    case 'Custom': {
      const interval = medication.customFrequencyDays ?? 1;
      if (interval <= 0) {
        return false;
      }
      return daysSinceStart % interval === 0;
    }

    default:
      return false;
  }
}

export function computeDisplayStatus(
  record: DoseRecord | undefined,
  medication: Medication,
  date: string,
  slotTime?: string,
): DoseStatus {
  const today = todayString();

  if (record !== undefined) {
    // Stale pending on past dates auto-resolves to missed; all other stored marks are explicit.
    if (record.status === 'pending' && date < today) {
      return 'missed';
    }
    return record.status;
  }

  if (date > today) {
    return 'pending';
  }

  if (date < today) {
    return 'missed';
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const reminderMinutes = parseTimeToMinutes(slotTime ?? medication.reminderTime);

  if (reminderMinutes < 0) {
    return 'pending';
  }

  if (nowMinutes >= reminderMinutes + 30) {
    return 'missed';
  }

  return 'pending';
}

export function computeCourseStatus(course: Course): CourseStatus {
  const today = todayString();
  const isUpcoming = course.startDate > today;
  const isCompleted = course.endDate < today;
  const isActive = !isUpcoming && !isCompleted;

  const daysLeft = isActive
    ? Math.max(0, diffInDays(today, course.endDate) + 1)
    : 0;

  const daysElapsed = isUpcoming
    ? 0
    : isCompleted
      ? course.durationDays
      : Math.max(0, diffInDays(course.startDate, today));

  const progressRatio = Math.min(
    1,
    Math.max(0, daysElapsed / course.durationDays),
  );

  let urgency: UrgencyLevel = 'Low';
  if (isActive) {
    if (daysLeft <= 3) {
      urgency = 'High';
    } else if (daysLeft <= 7) {
      urgency = 'Medium';
    }
  }

  return {
    isActive,
    isCompleted,
    isUpcoming,
    daysLeft,
    daysElapsed,
    progressRatio,
    urgency,
  };
}

function getScheduledDoseCountForDate(
  courses: Course[],
  date: string,
): number {
  let count = 0;
  for (const course of courses) {
    if (!isDateInCourseRange(date, course.startDate, course.endDate)) {
      continue;
    }
    for (const med of course.medications) {
      if (isDoseScheduledOnDate(med, course, date)) {
        count += med.frequency === 'Twice Daily' ? 2 : 1;
      }
    }
  }
  return count;
}

function getTakenCountForDate(
  courses: Course[],
  records: DoseRecord[],
  date: string,
): number {
  const dayRecords = records.filter(r => r.date === date && r.status === 'taken');
  let count = 0;
  for (const record of dayRecords) {
    const baseMedId = record.medicationId.replace(/_slot2$/, '');
    const course = courses.find(c => c.id === record.courseId);
    if (!course) {
      continue;
    }
    const med = course.medications.find(m => m.id === baseMedId);
    if (!med) {
      continue;
    }
    if (isDoseScheduledOnDate(med, course, date)) {
      count += 1;
    }
  }
  return count;
}

function computeDayAdherencePct(
  courses: Course[],
  records: DoseRecord[],
  date: string,
): number {
  const total = getScheduledDoseCountForDate(courses, date);
  if (total === 0) {
    return 0;
  }
  const taken = getTakenCountForDate(courses, records, date);
  return Math.round((taken / total) * 100);
}

function getDayStatus(
  adherencePct: number,
  date: string,
): WeekDay['status'] {
  const today = todayString();
  if (date > today) {
    return 'future';
  }
  if (adherencePct === 100) {
    return 'full';
  }
  if (adherencePct === 0) {
    return 'missed';
  }
  return 'partial';
}

export function computeAdherenceStats(
  courses: Course[],
  records: DoseRecord[],
): AdherenceStats {
  const today = todayString();
  const activeCourses = courses.filter(c => computeCourseStatus(c).isActive);

  const todayTotal = getScheduledDoseCountForDate(activeCourses, today);
  const todayTaken = getTakenCountForDate(activeCourses, records, today);

  const weeklyAdherence: WeekDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = format(subDays(parseISO(today), i), 'yyyy-MM-dd');
    const adherencePct = computeDayAdherencePct(courses, records, date);
    weeklyAdherence.push({
      date,
      dayLabel: format(parseISO(date), 'EEE'),
      adherencePct,
      status: getDayStatus(adherencePct, date),
    });
  }

  let dayStreak = 0;
  for (let i = 0; i < 365; i++) {
    const date = format(subDays(parseISO(today), i), 'yyyy-MM-dd');
    const total = getScheduledDoseCountForDate(courses, date);
    if (total === 0) {
      continue;
    }
    const taken = getTakenCountForDate(courses, records, date);
    if (taken === total) {
      dayStreak += 1;
      continue;
    }
    if (date === today) {
      continue;
    }
    break;
  }

  const thirtyDaysAgo = format(subDays(parseISO(today), 29), 'yyyy-MM-dd');
  let totalScheduled = 0;
  let totalTaken = 0;
  for (let d = thirtyDaysAgo; d <= today; d = addDaysToDateString(d, 1)) {
    const scheduled = getScheduledDoseCountForDate(courses, d);
    totalScheduled += scheduled;
    totalTaken += getTakenCountForDate(courses, records, d);
  }

  const avgAdherencePct =
    totalScheduled === 0
      ? 0
      : Math.round((totalTaken / totalScheduled) * 100);

  return {
    dayStreak,
    avgAdherencePct,
    activeCourseCount: activeCourses.length,
    weeklyAdherence,
    todayTaken,
    todayTotal,
  };
}

function resolveSecondReminderTime(medication: Medication): string {
  return (
    medication.secondReminderTime ??
    addHoursToTime(medication.reminderTime, 12)
  );
}

export function getMedicationSlots(
  medication: Medication,
): Array<{ medicationId: string; slotTime: string }> {
  if (medication.frequency === 'Twice Daily') {
    return [
      { medicationId: medication.id, slotTime: medication.reminderTime },
      {
        medicationId: `${medication.id}_slot2`,
        slotTime: resolveSecondReminderTime(medication),
      },
    ];
  }
  return [{ medicationId: medication.id, slotTime: medication.reminderTime }];
}

/** Advance dose status: missed → pending → taken → missed */
export function cycleDoseStatus(current: DoseStatus): DoseStatus {
  if (current === 'missed') {
    return 'pending';
  }
  if (current === 'pending') {
    return 'taken';
  }
  return 'missed';
}
