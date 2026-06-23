import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { taskDueAt } from '@/lib/health';
import type { Room, Task } from '@/types';

const ENABLED_KEY = 'notifications.enabled';
const REMINDER_HOUR = 9; // morning of the day a task comes due
const MAX_SCHEDULED = 60; // iOS caps pending local notifications at 64

// expo-notifications native methods aren't available on web.
const SUPPORTED = Platform.OS !== 'web';

if (SUPPORTED) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

export async function areRemindersEnabled(): Promise<boolean> {
  if (!SUPPORTED) return false;
  return (await AsyncStorage.getItem(ENABLED_KEY)) === '1';
}

/** Enable/disable reminders. Returns the resulting state (false if denied). */
export async function setRemindersEnabled(enabled: boolean): Promise<boolean> {
  if (!SUPPORTED) return false;
  if (enabled) {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') return false;
  } else {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
  await AsyncStorage.setItem(ENABLED_KEY, enabled ? '1' : '0');
  return enabled;
}

function reminderTime(dueAtMs: number): number {
  const d = new Date(dueAtMs);
  d.setHours(REMINDER_HOUR, 0, 0, 0);
  return d.getTime();
}

/**
 * Reschedule a morning reminder for each upcoming task due date. Cancels and
 * re-creates everything so it stays in sync with the current task list.
 */
export async function syncReminders(
  tasks: Task[],
  rooms: Room[],
  body: string,
  now: number = Date.now()
): Promise<void> {
  if (!SUPPORTED || !(await areRemindersEnabled())) return;
  await Notifications.cancelAllScheduledNotificationsAsync();

  const roomName = (id: string) => rooms.find((r) => r.id === id)?.label ?? '';
  const upcoming = tasks
    .map((task) => ({ task, at: reminderTime(taskDueAt(task, now)) }))
    .filter(({ at }) => at > now)
    .sort((a, b) => a.at - b.at)
    .slice(0, MAX_SCHEDULED);

  for (const { task, at } of upcoming) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: roomName(task.roomId) ? `${task.title} · ${roomName(task.roomId)}` : task.title,
        body,
        data: { taskId: task.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: new Date(at),
      },
    });
  }
}
