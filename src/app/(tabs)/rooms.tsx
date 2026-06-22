import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NewRoomModal } from '@/components/NewRoomModal';
import { RoomCard } from '@/components/RoomCard';
import { addRoom, deleteTask, useRooms, useTasks } from '@/lib/data';
import { colors, fonts, radii } from '@/theme';
import type { Room, Task } from '@/types';

export default function RoomsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rooms = useRooms();
  const tasks = useTasks();
  const [newRoomVisible, setNewRoomVisible] = useState(false);

  const openAdd = (room: Room) =>
    router.push({ pathname: '/task/new', params: { roomId: room.id } });
  const openTask = (task: Task) => router.push(`/task/${task.id}`);
  const openEdit = (task: Task) =>
    router.push({ pathname: '/task/new', params: { id: task.id } });

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>{t('rooms.title')}</Text>
        {rooms.map((room) => (
          <RoomCard
            key={room.id}
            room={room}
            tasks={tasks.filter((tk) => tk.roomId === room.id)}
            onAddTask={openAdd}
            onOpenTask={openTask}
            onEditTask={openEdit}
            onDeleteTask={(task) => deleteTask(task.id)}
          />
        ))}
        <Pressable style={styles.newRoom} onPress={() => setNewRoomVisible(true)}>
          <Text style={styles.newRoomText}>{t('rooms.newRoom')}</Text>
        </Pressable>
      </ScrollView>

      <NewRoomModal
        visible={newRoomVisible}
        onClose={() => setNewRoomVisible(false)}
        onAdd={(label) => addRoom(label)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.text, marginBottom: 18 },
  newRoom: {
    paddingVertical: 15,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.line6,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  newRoomText: { fontSize: 15, fontFamily: fonts.bold, color: colors.accentDark },
});
