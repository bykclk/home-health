import type { TFunction } from 'i18next';

import type { Task } from '@/types';

// A known Sunday (2023-01-01) to derive weekday names from an index 0..6.
const REF_SUNDAY = new Date(2023, 0, 1);

function weekdayDate(index: number): Date {
  const d = new Date(REF_SUNDAY);
  d.setDate(d.getDate() + index);
  return d;
}

export function weekdayLong(index: number, lang: string): string {
  return new Intl.DateTimeFormat(lang, { weekday: 'long' }).format(weekdayDate(index));
}

export function weekdayShort(index: number, lang: string): string {
  return new Intl.DateTimeFormat(lang, { weekday: 'short' }).format(weekdayDate(index));
}

/** Weekday indices ordered Monday-first: [1,2,3,4,5,6,0]. */
export const WEEKDAYS_MON_FIRST = [1, 2, 3, 4, 5, 6, 0];

export function repeatLabel(task: Task, t: TFunction, lang: string): string {
  if (task.repeatMode === 'fixed' && task.fixedWeekday != null) {
    return t('repeat.weekly', { day: weekdayLong(task.fixedWeekday, lang) });
  }
  return t('repeat.everyNDays', { count: task.intervalDays ?? 7 });
}

/**
 * Localized relative time like "today" / "2 days ago". Avoids
 * Intl.RelativeTimeFormat, which Hermes does not implement.
 */
export function relativeWhen(iso: string, t: TFunction): string {
  const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((dayStart(new Date()) - dayStart(new Date(iso))) / (24 * 60 * 60 * 1000));
  if (days <= 0) return t('time.today');
  if (days === 1) return t('time.yesterday');
  return t('time.daysAgo', { count: days });
}
