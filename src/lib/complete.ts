import * as Haptics from 'expo-haptics';

import { celebrate } from '@/lib/celebration';
import { completeTask } from '@/lib/data';
import { streak, taskState } from '@/lib/health';
import type { Task } from '@/types';

/** Complete a task with haptics + the celebration overlay. Shared by Home,
 * Rooms, and the task detail so the action stays identical everywhere. */
export function completeWithCelebration(task: Task, allTasks: Task[]) {
  const wasDone = taskState(task).done;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  completeTask(task.id);
  celebrate({ taskTitle: task.title, streak: streak(allTasks) + (wasDone ? 0 : 1) });
}
