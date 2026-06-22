import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScoreRing } from '@/components/ScoreRing';
import { TaskCircle } from '@/components/TaskCircle';
import { homeHealth, roomScore, streak, taskState } from '@/lib/health';
import { useRooms, useTasks } from '@/lib/data';
import { colors, fonts, radii } from '@/theme';

function caption(score: number): string {
  if (score >= 85) return 'home.captionGreat';
  if (score >= 65) return 'home.captionGood';
  if (score >= 40) return 'home.captionOk';
  return 'home.captionLow';
}

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rooms = useRooms();
  const tasks = useTasks();

  const score = homeHealth(tasks);
  const streakDays = streak(tasks);
  const roomsWithTasks = rooms
    .map((room) => ({ room, tasks: tasks.filter((tk) => tk.roomId === room.id) }))
    .filter((r) => r.tasks.length > 0);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <ScoreRing size={172} stroke={13} progress={score / 100}>
          <View style={styles.ringInner}>
            <Text style={styles.scoreNum}>
              {score}
              <Text style={styles.scorePct}>%</Text>
            </Text>
            <Text style={styles.scoreLabel}>{t('home.scoreLabel')}</Text>
          </View>
        </ScoreRing>
        <Text style={styles.caption}>{t(caption(score))}</Text>
        <View style={styles.streakChip}>
          <View style={styles.streakDot} />
          <Text style={styles.streakText}>{t('home.streak', { count: streakDays })}</Text>
        </View>
      </View>

      {roomsWithTasks.map(({ room, tasks: roomTasks }) => (
        <View key={room.id} style={styles.roomSection}>
          <View style={styles.roomHeader}>
            <Text style={styles.roomLabel}>{room.label.toUpperCase()}</Text>
            <Text style={styles.roomScore}>{t('room.clean', { pct: `${roomScore(roomTasks)}%` })}</Text>
          </View>
          <View style={styles.grid}>
            {roomTasks.map((task) => (
              <Pressable
                key={task.id}
                style={styles.gridItem}
                onPress={() => router.push(`/task/${task.id}`)}>
                <TaskCircle size={122} state={taskState(task)} showText />
                <Text style={styles.taskTitle}>{task.title}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  hero: { alignItems: 'center', marginBottom: 26 },
  ringInner: { alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontFamily: fonts.serif, fontSize: 52, color: colors.text, lineHeight: 56 },
  scorePct: { fontSize: 22, color: colors.muted },
  scoreLabel: {
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    color: colors.muted,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  caption: { fontSize: 14, color: colors.muted2, marginTop: 14 },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 12,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  streakDot: { width: 8, height: 8, borderRadius: 2, backgroundColor: colors.accent, transform: [{ rotate: '45deg' }] },
  streakText: { fontSize: 12, fontFamily: fonts.bold, color: colors.text },

  roomSection: { marginBottom: 24 },
  roomHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 14 },
  roomLabel: { fontSize: 12, fontFamily: fonts.bold, letterSpacing: 1, color: colors.muted },
  roomScore: { fontSize: 12, fontFamily: fonts.semibold, color: colors.muted4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 22 },
  gridItem: { width: '47%', alignItems: 'center', gap: 10 },
  taskTitle: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text, textAlign: 'center', lineHeight: 17 },
});
