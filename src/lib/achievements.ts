/**
 * Milestone achievements, all derived from existing data (no extra state).
 */
import { homeHealth, streak, total } from '@/lib/health';
import type { Member, Room, Task } from '@/types';

type Metric = 'total' | 'streak' | 'score' | 'rooms' | 'members';

interface Achievement {
  id: string;
  emoji: string;
  goal: number;
  metric: Metric;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', emoji: '🧽', goal: 1, metric: 'total' },
  { id: 'streak3', emoji: '🔥', goal: 3, metric: 'streak' },
  { id: 'ten', emoji: '🧹', goal: 10, metric: 'total' },
  { id: 'rooms3', emoji: '🏠', goal: 3, metric: 'rooms' },
  { id: 'streak7', emoji: '📅', goal: 7, metric: 'streak' },
  { id: 'team', emoji: '👥', goal: 2, metric: 'members' },
  { id: 'fifty', emoji: '💪', goal: 50, metric: 'total' },
  { id: 'spotless', emoji: '✨', goal: 90, metric: 'score' },
  { id: 'hundred', emoji: '💯', goal: 100, metric: 'total' },
  { id: 'streak30', emoji: '🏆', goal: 30, metric: 'streak' },
];

export interface AchievementView {
  id: string;
  emoji: string;
  goal: number;
  value: number;
  unlocked: boolean;
  progress: number;
}

export function computeAchievements(tasks: Task[], rooms: Room[], members: Member[]): AchievementView[] {
  const stats: Record<Metric, number> = {
    total: total(tasks),
    streak: streak(tasks),
    score: homeHealth(tasks),
    rooms: rooms.length,
    members: members.length,
  };
  return ACHIEVEMENTS.map((a) => {
    const value = stats[a.metric];
    return {
      id: a.id,
      emoji: a.emoji,
      goal: a.goal,
      value,
      unlocked: value >= a.goal,
      progress: Math.min(1, value / a.goal),
    };
  });
}
