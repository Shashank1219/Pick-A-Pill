import { Course, DoseRecord, Medication } from '@/types';
import {
  computeAdherenceStats,
  computeCourseStatus,
  computeDisplayStatus,
  cycleDoseStatus,
  isDoseScheduledOnDate,
} from '@/utils/courseHelpers';
import * as dateHelpers from '@/utils/dateHelpers';

function makeMedication(partial: Partial<Medication> = {}): Medication {
  return {
    id: 'med-1',
    name: 'Aspirin',
    dosageStrength: '100mg',
    formFactor: 'Pill',
    frequency: 'Daily',
    reminderTime: '08:00',
    ...partial,
  };
}

function makeCourse(partial: Partial<Course> = {}): Course {
  return {
    id: 'course-1',
    name: 'Test Course',
    startDate: '2024-01-01',
    durationDays: 30,
    endDate: '2024-01-30',
    medications: [makeMedication()],
    ...partial,
  };
}

describe('isDoseScheduledOnDate', () => {
  const course = makeCourse({
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    durationDays: 365,
  });

  it('returns true for Daily within course range', () => {
    const med = makeMedication({ frequency: 'Daily' });
    expect(isDoseScheduledOnDate(med, course, '2024-06-15')).toBe(true);
  });

  it('returns false for Daily outside course range', () => {
    const med = makeMedication({ frequency: 'Daily' });
    expect(isDoseScheduledOnDate(med, course, '2023-12-31')).toBe(false);
  });

  it('returns true for Twice Daily within course range', () => {
    const med = makeMedication({ frequency: 'Twice Daily', secondReminderTime: '20:00' });
    expect(isDoseScheduledOnDate(med, course, '2024-06-15')).toBe(true);
  });

  it('schedules Alternate Days from course start', () => {
    const med = makeMedication({ frequency: 'Alternate Days' });
    const altCourse = makeCourse({ startDate: '2024-01-01', endDate: '2024-12-31' });
    expect(isDoseScheduledOnDate(med, altCourse, '2024-01-01')).toBe(true);
    expect(isDoseScheduledOnDate(med, altCourse, '2024-01-02')).toBe(false);
    expect(isDoseScheduledOnDate(med, altCourse, '2024-01-03')).toBe(true);
  });

  it('schedules Weekly only on selected weekdays', () => {
    const med = makeMedication({
      frequency: 'Weekly',
      selectedWeekdays: ['Mon', 'Wed'],
    });
    expect(isDoseScheduledOnDate(med, course, '2024-01-01')).toBe(true);
    expect(isDoseScheduledOnDate(med, course, '2024-01-02')).toBe(false);
    expect(isDoseScheduledOnDate(med, course, '2024-01-03')).toBe(true);
  });

  it('clamps Monthly doses to the last day of short months', () => {
    const med = makeMedication({ frequency: 'Monthly' });
    const monthlyCourse = makeCourse({
      startDate: '2024-01-31',
      endDate: '2025-12-31',
      durationDays: 700,
    });
    expect(isDoseScheduledOnDate(med, monthlyCourse, '2024-02-29')).toBe(true);
    expect(isDoseScheduledOnDate(med, monthlyCourse, '2025-02-28')).toBe(true);
    expect(isDoseScheduledOnDate(med, monthlyCourse, '2024-02-28')).toBe(false);
  });

  it('schedules Custom frequency every N days from start', () => {
    const med = makeMedication({ frequency: 'Custom', customFrequencyDays: 3 });
    const customCourse = makeCourse({ startDate: '2024-01-01', endDate: '2024-12-31' });
    expect(isDoseScheduledOnDate(med, customCourse, '2024-01-01')).toBe(true);
    expect(isDoseScheduledOnDate(med, customCourse, '2024-01-04')).toBe(true);
    expect(isDoseScheduledOnDate(med, customCourse, '2024-01-02')).toBe(false);
  });

  it('returns false for Custom with zero or invalid interval', () => {
    const med = makeMedication({ frequency: 'Custom', customFrequencyDays: 0 });
    expect(isDoseScheduledOnDate(med, course, '2024-01-01')).toBe(false);
  });
});

describe('computeDisplayStatus', () => {
  const medication = makeMedication({ reminderTime: '08:00' });

  beforeEach(() => {
    jest.spyOn(dateHelpers, 'todayString').mockReturnValue('2024-06-15');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns pending for future dates', () => {
    expect(computeDisplayStatus(undefined, medication, '2024-06-16')).toBe('pending');
  });

  it('returns missed for past dates with no record', () => {
    expect(computeDisplayStatus(undefined, medication, '2024-06-14')).toBe('missed');
  });

  it('returns pending today before grace period ends', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T08:15:00'));
    expect(computeDisplayStatus(undefined, medication, '2024-06-15')).toBe('pending');
    jest.useRealTimers();
  });

  it('returns missed today after grace period with no record', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T09:00:00'));
    expect(computeDisplayStatus(undefined, medication, '2024-06-15')).toBe('missed');
    jest.useRealTimers();
  });

  it('returns stored record status regardless of time', () => {
    const record: DoseRecord = {
      id: 'dose-1',
      courseId: 'course-1',
      medicationId: 'med-1',
      date: '2024-06-15',
      status: 'taken',
    };
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T23:59:00'));
    expect(computeDisplayStatus(record, medication, '2024-06-15')).toBe('taken');
    jest.useRealTimers();
  });

  it('returns pending when slot time is invalid', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-06-15T12:00:00'));
    expect(
      computeDisplayStatus(undefined, medication, '2024-06-15', 'invalid'),
    ).toBe('pending');
    jest.useRealTimers();
  });
});

describe('computeCourseStatus', () => {
  beforeEach(() => {
    jest.spyOn(dateHelpers, 'todayString').mockReturnValue('2024-06-15');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('marks upcoming courses before start date', () => {
    const status = computeCourseStatus(
      makeCourse({ startDate: '2024-06-20', endDate: '2024-07-20', durationDays: 31 }),
    );
    expect(status.isUpcoming).toBe(true);
    expect(status.isActive).toBe(false);
    expect(status.isCompleted).toBe(false);
  });

  it('marks active courses on start and end boundary days', () => {
    const startDay = computeCourseStatus(
      makeCourse({ startDate: '2024-06-15', endDate: '2024-07-15', durationDays: 31 }),
    );
    const endDay = computeCourseStatus(
      makeCourse({ startDate: '2024-05-15', endDate: '2024-06-15', durationDays: 32 }),
    );
    expect(startDay.isActive).toBe(true);
    expect(endDay.isActive).toBe(true);
    expect(endDay.isCompleted).toBe(false);
  });

  it('marks completed courses after end date', () => {
    const status = computeCourseStatus(
      makeCourse({ startDate: '2024-05-01', endDate: '2024-06-10', durationDays: 41 }),
    );
    expect(status.isCompleted).toBe(true);
    expect(status.isActive).toBe(false);
  });
});

describe('cycleDoseStatus', () => {
  it('cycles missed → pending → taken → missed', () => {
    expect(cycleDoseStatus('missed')).toBe('pending');
    expect(cycleDoseStatus('pending')).toBe('taken');
    expect(cycleDoseStatus('taken')).toBe('missed');
  });

  it('loops back to missed after a full rotation', () => {
    let status = cycleDoseStatus('missed');
    status = cycleDoseStatus(status);
    status = cycleDoseStatus(status);
    expect(status).toBe('missed');
  });
});

describe('computeAdherenceStats', () => {
  beforeEach(() => {
    jest.spyOn(dateHelpers, 'todayString').mockReturnValue('2024-06-15');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns zeros for empty records and no courses', () => {
    const stats = computeAdherenceStats([], []);
    expect(stats.dayStreak).toBe(0);
    expect(stats.avgAdherencePct).toBe(0);
    expect(stats.todayTotal).toBe(0);
  });

  it('counts all-taken history toward streak', () => {
    const med = makeMedication();
    const course = makeCourse({
      startDate: '2024-06-10',
      endDate: '2024-06-14',
      durationDays: 5,
      medications: [med],
    });
    const records: DoseRecord[] = ['2024-06-10', '2024-06-11', '2024-06-12', '2024-06-13', '2024-06-14'].map(
      (date, index) => ({
        id: `dose-${index}`,
        courseId: course.id,
        medicationId: med.id,
        date,
        status: 'taken' as const,
      }),
    );
    const stats = computeAdherenceStats([course], records);
    expect(stats.dayStreak).toBe(5);
  });

  it('breaks streak on all-missed scheduled day in the past', () => {
    const med = makeMedication();
    const course = makeCourse({
      startDate: '2024-06-13',
      endDate: '2024-06-14',
      durationDays: 2,
      medications: [med],
    });
    const stats = computeAdherenceStats([course], []);
    expect(stats.dayStreak).toBe(0);
  });

  it('skips gap days with no scheduled doses when computing streak', () => {
    const med = makeMedication();
    const pastCourse = makeCourse({
      id: 'past-course',
      startDate: '2024-06-10',
      endDate: '2024-06-14',
      durationDays: 5,
      medications: [med],
    });
    const todayCourse = makeCourse({
      id: 'today-course',
      startDate: '2024-06-15',
      endDate: '2024-06-20',
      durationDays: 6,
      medications: [makeMedication({ id: 'med-2' })],
    });
    const records: DoseRecord[] = ['2024-06-10', '2024-06-11', '2024-06-12', '2024-06-13', '2024-06-14'].map(
      (date, index) => ({
        id: `dose-${index}`,
        courseId: pastCourse.id,
        medicationId: med.id,
        date,
        status: 'taken' as const,
      }),
    );
    const stats = computeAdherenceStats([pastCourse, todayCourse], records);
    expect(stats.dayStreak).toBe(5);
  });
});
