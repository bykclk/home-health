import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { TabBar } from '@/components/TabBar';
import { useRooms, useTasks } from '@/lib/data';
import { syncReminders } from '@/lib/notifications';

export default function TabsLayout() {
  const { t } = useTranslation();
  const tasks = useTasks();
  const rooms = useRooms();

  // Keep task reminders in sync with the data and refresh on app foreground.
  useEffect(() => {
    syncReminders(tasks, rooms, t('notifications.dueBody'));
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncReminders(tasks, rooms, t('notifications.dueBody'));
    });
    return () => sub.remove();
  }, [tasks, rooms, t]);

  return (
    <Tabs screenOptions={{ headerShown: false }} tabBar={(props) => <TabBar {...(props as any)} />}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="rooms" />
      <Tabs.Screen name="stats" />
      <Tabs.Screen name="members" />
    </Tabs>
  );
}
