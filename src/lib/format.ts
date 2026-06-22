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

/** Localized relative time like "today" / "2 days ago". */
export function relativeWhen(iso: string, lang: string): string {
  const then = new Date(iso);
  const a = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime();
  const now = new Date();
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const days = Math.round((a - b) / (24 * 60 * 60 * 1000));
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  return rtf.format(days, 'day');
}
