import {
  formatDayCourse,
  formatDaysCompleted,
  formatDaysCompletedOfTotal,
  formatDaysLeft,
  pluralizeDay,
} from '@/utils/formatLabels';

describe('formatLabels', () => {
  it('pluralizes day correctly', () => {
    expect(pluralizeDay(1)).toBe('day');
    expect(pluralizeDay(2)).toBe('days');
    expect(pluralizeDay(0)).toBe('days');
  });

  it('formats completed and left labels', () => {
    expect(formatDaysCompleted(0)).toBe('0 days completed');
    expect(formatDaysCompleted(1)).toBe('1 day completed');
    expect(formatDaysLeft(1)).toBe('1 day left');
    expect(formatDaysLeft(9)).toBe('9 days left');
  });

  it('formats course duration label', () => {
    expect(formatDayCourse(1)).toBe('1-day course');
    expect(formatDayCourse(30)).toBe('30-day course');
  });

  it('formats completed-of-total label', () => {
    expect(formatDaysCompletedOfTotal(0, 30)).toBe('0 of 30 days completed');
    expect(formatDaysCompletedOfTotal(1, 30)).toBe('1 of 30 days completed');
    expect(formatDaysCompletedOfTotal(1, 1)).toBe('1 of 1 day completed');
  });
});
