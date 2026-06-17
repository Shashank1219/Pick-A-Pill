import {
  addDays,
  differenceInDays,
  format,
  parse,
  parseISO,
} from 'date-fns';

export function todayString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function formatDisplayDate(dateStr: string): string {
  const date = parseISO(dateStr);
  return format(date, 'MMM d, yyyy');
}

export function formatTime(hhmm: string): string {
  const parsed = parse(hhmm, 'HH:mm', new Date());
  return format(parsed, 'h:mm a');
}

export function addDaysToDateString(dateStr: string, days: number): string {
  const date = parseISO(dateStr);
  return format(addDays(date, days), 'yyyy-MM-dd');
}

export function diffInDays(fromDateStr: string, toDateStr: string): number {
  const from = parseISO(fromDateStr);
  const to = parseISO(toDateStr);
  return differenceInDays(to, from);
}

export function parseTimeToMinutes(hhmm: string): number {
  const [hours, minutes] = hhmm.split(':').map(Number);
  return hours * 60 + minutes;
}

export function addHoursToTime(hhmm: string, hours: number): string {
  const totalMinutes = parseTimeToMinutes(hhmm) + hours * 60;
  const capped = Math.min(totalMinutes, 23 * 60 + 59);
  const h = Math.floor(capped / 60);
  const m = capped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function isDateInCourseRange(
  date: string,
  startDate: string,
  endDate: string,
): boolean {
  return date >= startDate && date <= endDate;
}
