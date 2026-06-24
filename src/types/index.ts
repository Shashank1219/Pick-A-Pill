export type FormFactor = 'Pill' | 'Liquid' | 'Injection';

export type Frequency =
  | 'Daily'
  | 'Twice Daily'
  | 'Alternate Days'
  | 'Weekly'
  | 'Monthly'
  | 'Custom';

export type WeekdayCode = 'Sun' | 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';

export type DoseStatus = 'taken' | 'missed' | 'pending';

export type UrgencyLevel = 'Low' | 'Medium' | 'High';

export interface Medication {
  id: string;
  name: string;
  dosageStrength: string;
  formFactor: FormFactor;
  frequency: Frequency;
  customFrequencyDays?: number;
  selectedWeekdays?: WeekdayCode[];
  reminderTime: string;
  secondReminderTime?: string;
}

export interface Course {
  id: string;
  name: string;
  startDate: string;
  durationDays: number;
  endDate: string;
  medications: Medication[];
}

export interface DoseRecord {
  id: string;
  courseId: string;
  medicationId: string;
  date: string;
  status: DoseStatus;
  markedAt?: string;
}

export interface CourseStatus {
  isActive: boolean;
  isCompleted: boolean;
  isUpcoming: boolean;
  daysLeft: number;
  daysElapsed: number;
  progressRatio: number;
  urgency: UrgencyLevel;
}

export interface UserProfile {
  name: string;
  email?: string;
  notificationsEnabled: boolean;
  refillReminderDays: number;
  language: string;
}

export interface AdherenceStats {
  dayStreak: number;
  avgAdherencePct: number;
  activeCourseCount: number;
  weeklyAdherence: WeekDay[];
  todayTaken: number;
  todayTotal: number;
}

export interface WeekDay {
  date: string;
  dayLabel: string;
  adherencePct: number;
  status: 'full' | 'partial' | 'missed' | 'future';
}
