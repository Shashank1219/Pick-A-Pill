import { addHoursToTime, formatTime } from '@/utils/dateHelpers';

describe('formatTime', () => {
  it('returns em dash for empty string', () => {
    expect(formatTime('')).toBe('—');
  });

  it('returns em dash for invalid time strings', () => {
    expect(formatTime('not-a-time')).toBe('—');
  });

  it('formats valid times', () => {
    expect(formatTime('08:00')).toBe('8:00 AM');
  });
});

describe('addHoursToTime', () => {
  it('adds hours within the same day', () => {
    expect(addHoursToTime('08:00', 12)).toBe('20:00');
  });

  it('wraps past midnight', () => {
    expect(addHoursToTime('13:00', 12)).toBe('01:00');
    expect(addHoursToTime('20:00', 12)).toBe('08:00');
  });

  it('wraps multi-day offsets modulo 24 hours', () => {
    expect(addHoursToTime('08:00', 36)).toBe('20:00');
  });
});
