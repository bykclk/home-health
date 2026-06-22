import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TaskCircle } from '@/components/TaskCircle';
import { repeatLabel } from '@/lib/format';
import { roomScore, scoreColor, taskState } from '@/lib/health';
import { colors, fonts, radii, shadow } from '@/theme';
import type { Room, Task } from '@/types';

interface Props {
  room: Room;
  tasks: Task[];
  onAddTask: (room: Room) => void;
  onOpenTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
}

export function RoomCard({ room, tasks, onAddTask, onOpenTask, onEditTask, onDeleteTask }: Props) {
  const { t, i18n } = useTranslation();
  const [managing, setManaging] = useState(false);
  const score = roomScore(tasks);
  const color = scoreColor(score);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{room.label}</Text>
          <Text style={styles.count}>{t('rooms.taskCount', { count: tasks.length })}</Text>
        </View>
        <View style={styles.scoreWrap}>
          <Text style={[styles.score, { color }]}>{score}%</Text>
          <Text style={styles.scoreLabel}>{t('rooms.cleanLabel')}</Text>
        </View>
      </View>

      <View style={styles.barWrap}>
        <View style={[styles.barFill, { width: `${score}%`, backgroundColor: color }]} />
      </View>

      {tasks.length === 0 ? (
        <Text style={styles.empty}>{t('rooms.empty')}</Text>
      ) : managing ? (
        <View>
          {tasks.map((task) => {
            const s = taskState(task);
            return (
              <View key={task.id} style={styles.manageRow}>
                <View style={[styles.dot, { backgroundColor: s.fillColor }]} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={styles.manageTitle}>{task.title}</Text>
                  <Text style={styles.manageMeta}>{repeatLabel(task, t, i18n.language)}</Text>
                </View>
                <Pressable style={styles.editBtn} onPress={() => onEditTask(task)}>
                  <Text style={styles.editText}>{t('common.edit')}</Text>
                </Pressable>
                <Pressable style={styles.deleteBtn} onPress={() => onDeleteTask(task)}>
                  <Text style={styles.deleteText}>{t('common.delete')}</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={styles.chips}>
          {tasks.map((task) => (
            <Pressable key={task.id} style={styles.chip} onPress={() => onOpenTask(task)}>
              <TaskCircle size={56} state={taskState(task)} />
              <Text style={styles.chipTitle} numberOfLines={2}>
                {task.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <View style={styles.actions}>
        <Pressable style={styles.primaryBtn} onPress={() => onAddTask(room)}>
          <Text style={styles.primaryText}>{t('rooms.addTask')}</Text>
        </Pressable>
        <Pressable style={styles.secondaryBtn} onPress={() => setManaging((m) => !m)}>
          <Text style={styles.secondaryText}>{managing ? t('rooms.done') : t('rooms.manage')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 14,
    ...shadow.card,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  label: { fontFamily: fonts.serif, fontSize: 20, color: colors.text },
  count: { fontSize: 12, color: colors.muted, marginTop: 1 },
  scoreWrap: { alignItems: 'flex-end' },
  score: { fontFamily: fonts.serif, fontSize: 22 },
  scoreLabel: { fontSize: 10, color: colors.muted, fontFamily: fonts.semibold },

  barWrap: { height: 6, borderRadius: radii.pill, backgroundColor: colors.track, overflow: 'hidden', marginBottom: 16 },
  barFill: { height: '100%', borderRadius: radii.pill },

  empty: { fontSize: 13, color: colors.muted4, paddingVertical: 2 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  chip: { alignItems: 'center', gap: 6, width: 64 },
  chipTitle: { fontSize: 10.5, fontFamily: fonts.semibold, color: colors.text, textAlign: 'center', lineHeight: 13 },

  manageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.line3,
  },
  dot: { width: 12, height: 12, borderRadius: radii.pill },
  manageTitle: { fontSize: 15, fontFamily: fonts.semibold, color: colors.text },
  manageMeta: { fontSize: 12, color: colors.muted, marginTop: 1 },
  editBtn: { borderWidth: 1, borderColor: colors.line5, paddingVertical: 7, paddingHorizontal: 12, borderRadius: radii.pill },
  editText: { fontSize: 12, fontFamily: fonts.bold, color: colors.muted2 },
  deleteBtn: { paddingVertical: 7, paddingHorizontal: 4 },
  deleteText: { fontSize: 12, fontFamily: fonts.bold, color: colors.danger },

  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  primaryBtn: { flex: 1, paddingVertical: 11, borderRadius: radii.sm, backgroundColor: colors.accent, alignItems: 'center' },
  primaryText: { fontSize: 13, fontFamily: fonts.bold, color: '#fff' },
  secondaryBtn: { flex: 1, paddingVertical: 11, borderRadius: radii.sm, borderWidth: 1.5, borderColor: colors.line5, alignItems: 'center' },
  secondaryText: { fontSize: 13, fontFamily: fonts.bold, color: colors.muted2 },
});
