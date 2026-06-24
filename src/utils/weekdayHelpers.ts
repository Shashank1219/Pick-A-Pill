import { format, parseISO } from 'date-fns';

import { Frequency, WeekdayCode } from '@/types';

export const WEEKDAY_CODES: WeekdayCode[] = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

const WEEKDAY_INDEX: Record<WeekdayCode, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export function isWeekdayFrequency(frequency: Frequency): boolean {
  return frequency === 'Weekly';
}

export function weekdayCodeFromDate(dateStr: string): WeekdayCode {
  return format(parseISO(dateStr), 'EEE') as WeekdayCode;
}

export function weekdayCodeToIndex(code: WeekdayCode): number {
  return WEEKDAY_INDEX[code];
}

export function formatFrequencyDisplay(
  frequency: Frequency,
  selectedWeekdays?: WeekdayCode[],
): string {
  if (isWeekdayFrequency(frequency) && selectedWeekdays && selectedWeekdays.length > 0) {
    return `${frequency} — ${selectedWeekdays.join(', ')}`;
  }
  return frequency;
}
