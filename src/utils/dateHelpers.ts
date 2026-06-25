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
  if (!hhmm) {
    return '—';
  }
  const parsed = parse(hhmm, 'HH:mm', new Date());
  if (isNaN(parsed.getTime())) {
    return '—';
  }
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
  if (!hhmm || !/^\d{1,2}:\d{2}$/.test(hhmm)) {
    return -1;
  }
  const [hours, minutes] = hhmm.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) {
    return -1;
  }
  return hours * 60 + minutes;
}

export function addHoursToTime(hhmm: string, hours: number): string {
  const baseMinutes = parseTimeToMinutes(hhmm);
  if (baseMinutes < 0) {
    return hhmm;
  }
  const totalMinutes = baseMinutes + hours * 60;
  const wrapped = totalMinutes % (24 * 60);
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function isDateInCourseRange(
  date: string,
  startDate: string,
  endDate: string,
): boolean {
  return date >= startDate && date <= endDate;
}
