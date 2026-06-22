/**
 * Pure home-health logic. No React, no i18n — returns data and i18n keys only,
 * so it can be unit-tested and shared across Home / Rooms / Stats / Detail.
 */
import { colors, withAlpha } from '@/theme';
import type { Task, TaskLevel, TaskState } from '@/types';

const DAY_MS = 24 * 60 * 60 * 1000;

/** Start of local day for a given time. */
function startOfDay(ms: number): number {
  const d = new Date(ms);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Whole-day difference (b - a), counting calendar days. */
function dayDiff(aMs: number, bMs: number): number {
  return Math.round((startOfDay(bMs) - startOfDay(aMs)) / DAY_MS);
}

/** Most recent completion timestamp, or null if never completed. */
export function lastDoneMs(task: Task): number | null {
  if (!task.completions.length) return null;
  let max = -Infinity;
  for (const c of task.completions) {
    const t = Date.parse(c);
    if (t > max) max = t;
  }
  return max === -Infinity ? null : max;
}

function levelFor(progress: number): TaskLevel {
  if (progress >= 1) return 'overdue';
  if (progress >= 0.66) return 'soon';
  return 'clean';
}

function colorFor(level: TaskLevel): string {
  if (level === 'overdue') return colors.overdue;
  if (level === 'soon') return colors.soon;
  return colors.fresh;
}

/**
 * Compute the freshness/decay state of a task at a given moment.
 * progress 0 => just cleaned; progress >= 1 => due or overdue.
 */
export function taskState(task: Task, now: number = Date.now()): TaskState {
  const baseline = lastDoneMs(task) ?? Date.parse(task.createdAt);

  let progress: number;
  let daysLeft: number;

  if (task.repeatMode === 'fixed' && task.fixedWeekday != null) {
    const next = nextWeekdayMs(now, task.fixedWeekday);
    const prev = next - 7 * DAY_MS;
    // Done this cycle if the last completion is at or after the previous due date.
    const doneThisCycle = baseline >= prev;
    daysLeft = dayDiff(now, next);
    progress = doneThisCycle ? Math.max(0, (now - prev) / (next - prev)) : 1;
  } else {
    const intervalDays = Math.max(1, task.intervalDays ?? 7);
    const elapsed = (now - baseline) / DAY_MS;
    progress = elapsed / intervalDays;
    daysLeft = Math.ceil(intervalDays - elapsed);
  }

  const level = levelFor(progress);
  const fillColor = colorFor(level);
  const fillWash = withAlpha(fillColor, 0.14);
  const fillPct = `${Math.round(Math.max(0, Math.min(1, progress)) * 100)}%`;
  // "Done for the current cycle": completed at least once and not yet due again.
  // A never-completed task is NOT done (its baseline is createdAt), so the
  // detail screen offers "Mark done" rather than a no-op "Undo".
  const done = task.completions.length > 0 && progress < 1;

  let dueShort: string;
  let fillLabelKey: string;
  if (level === 'overdue') {
    dueShort = '!';
    fillLabelKey = 'task.overdue';
  } else if (daysLeft <= 0) {
    dueShort = '0';
    fillLabelKey = 'task.today';
  } else {
    dueShort = String(daysLeft);
    fillLabelKey = 'task.daysLeftShort';
  }

  return { progress, fillPct, level, fillColor, fillWash, daysLeft, dueShort, fillLabelKey, done };
}

/** Next date (>= today) whose weekday matches, as a midnight timestamp. */
function nextWeekdayMs(now: number, weekday: number): number {
  const d = new Date(startOfDay(now));
  const delta = (weekday - d.getDay() + 7) % 7;
  d.setDate(d.getDate() + delta);
  return d.getTime();
}

/** Cleanliness percentage (0..100) — average freshness across tasks. */
export function roomScore(tasks: Task[], now: number = Date.now()): number {
  if (!tasks.length) return 100;
  const sum = tasks.reduce((acc, t) => {
    const p = Math.min(1, Math.max(0, taskState(t, now).progress));
    return acc + (1 - p);
  }, 0);
  return Math.round((sum / tasks.length) * 100);
}

/** Overall home-health percentage across all tasks. */
export function homeHealth(tasks: Task[], now: number = Date.now()): number {
  return roomScore(tasks, now);
}

/** All completion timestamps across tasks, as ms. */
function allCompletions(tasks: Task[]): number[] {
  return tasks.flatMap((t) => t.completions.map((c) => Date.parse(c))).filter((n) => !Number.isNaN(n));
}

/** Total number of completions across all tasks. */
export function total(tasks: Task[]): number {
  return tasks.reduce((acc, t) => acc + t.completions.length, 0);
}

/** Consecutive days up to today that have at least one completion. */
export function streak(tasks: Task[], now: number = Date.now()): number {
  const days = new Set(allCompletions(tasks).map((ms) => startOfDay(ms)));
  if (!days.size) return 0;
  let count = 0;
  let cursor = startOfDay(now);
  // Allow the streak to "hold" if nothing was done yet today but yesterday was.
  if (!days.has(cursor)) cursor -= DAY_MS;
  while (days.has(cursor)) {
    count += 1;
    cursor -= DAY_MS;
  }
  return count;
}

export interface DayBucket {
  /** Midnight timestamp of the day. */
  date: number;
  count: number;
}

/** Completion counts for the last 7 days (oldest -> newest). */
export function last7Days(tasks: Task[], now: number = Date.now()): DayBucket[] {
  const today = startOfDay(now);
  const buckets: DayBucket[] = [];
  for (let i = 6; i >= 0; i--) buckets.push({ date: today - i * DAY_MS, count: 0 });
  const index = new Map(buckets.map((b, i) => [b.date, i]));
  for (const ms of allCompletions(tasks)) {
    const i = index.get(startOfDay(ms));
    if (i != null) buckets[i].count += 1;
  }
  return buckets;
}

/** Pick a freshness color for a 0..100 score (used by room/score bars). */
export function scoreColor(pct: number): string {
  if (pct >= 66) return colors.fresh;
  if (pct >= 40) return colors.soon;
  return colors.overdue;
}
