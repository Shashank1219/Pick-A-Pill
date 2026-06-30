export function pluralizeDay(count: number): string {
  return count === 1 ? 'day' : 'days';
}

export function formatDaysCompleted(count: number): string {
  return `${count} ${pluralizeDay(count)} completed`;
}

export function formatDaysLeft(count: number): string {
  return `${count} ${pluralizeDay(count)} left`;
}

export function formatDayCourse(count: number): string {
  return `${count}-day course`;
}

export function formatDaysCompletedOfTotal(
  completed: number,
  total: number,
): string {
  return `${completed} of ${total} ${pluralizeDay(total)} completed`;
}
