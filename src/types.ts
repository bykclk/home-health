export type RepeatMode = 'interval' | 'fixed';

export interface Member {
  id: string;
  name: string;
  initial: string;
  color: string;
  /** i18n key for the member's role label, e.g. 'members.roleOwner' */
  roleKey?: string;
}

export interface Room {
  id: string;
  label: string;
  position: number;
  emoji?: string;
}

export interface Task {
  id: string;
  roomId: string;
  title: string;
  repeatMode: RepeatMode;
  /** Days between cleanings when repeatMode === 'interval'. */
  intervalDays?: number;
  /** 0 (Sunday) .. 6 (Saturday) when repeatMode === 'fixed'. */
  fixedWeekday?: number;
  assigneeIds: string[];
  /** ISO timestamps of past completions, any order. */
  completions: string[];
  /** ISO timestamp used as the freshness baseline before the first completion. */
  createdAt: string;
  emoji?: string;
}

export interface Household {
  id: string;
  name: string;
  inviteCode: string;
}

export interface Profile {
  id: string;
  displayName: string;
  initial: string;
  color: string;
}

export type TaskLevel = 'clean' | 'soon' | 'overdue';

export interface TaskState {
  /** Elapsed fraction of the repeat cycle (0 = just cleaned, >=1 = due/overdue). */
  progress: number;
  /** Visual fill height as a percentage string, e.g. '64%'. */
  fillPct: string;
  level: TaskLevel;
  fillColor: string;
  fillWash: string;
  /** Whole days until due; negative when overdue. */
  daysLeft: number;
  /** Big short token shown inside the circle. */
  dueShort: string;
  /** i18n key for the small label under dueShort. */
  fillLabelKey: string;
  /** Whether the task is considered done for its current cycle. */
  done: boolean;
}
