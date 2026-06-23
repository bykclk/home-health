import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { AnimatedNumber } from '@/components/AnimatedNumber';
import { ScoreRing } from '@/components/ScoreRing';
import { TaskCircle } from '@/components/TaskCircle';
import { completeWithCelebration } from '@/lib/complete';
import { homeHealth, streak, taskState } from '@/lib/health';
import { useRooms, useTasks } from '@/lib/data';
import { colors, fonts, radii, shadow } from '@/theme';
import type { Task } from '@/types';

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
  const roomLabel = (id: string) => rooms.find((r) => r.id === id)?.label ?? '';

  const onComplete = (task: Task) => completeWithCelebration(task, tasks);

  // Only tasks that need attention (not clean), most urgent first.
  const attention = tasks
    .map((task) => ({ task, state: taskState(task) }))
    .filter(({ state }) => state.level !== 'clean')
    .sort((a, b) => b.state.progress - a.state.progress);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <ScoreRing size={172} stroke={13} progress={score / 100}>
          <View style={styles.ringInner}>
            <Text style={styles.scoreNum}>
              <AnimatedNumber value={score} />
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

      {attention.length > 0 ? (
        <>
          <Text style={styles.sectionLabel}>{t('home.needsAttention')}</Text>
          <View style={styles.grid}>
            {attention.map(({ task, state }) => (
              <View key={task.id} style={styles.gridItem}>
                <View style={styles.circleWrap}>
                  <TaskCircle
                    size={122}
                    state={state}
                    showText
                    onPress={() => router.push(`/task/${task.id}`)}
                  />
                  <Pressable style={styles.doneBadge} hitSlop={8} onPress={() => onComplete(task)}>
                    <Svg width={17} height={17} viewBox="0 0 14 14">
                      <Path d="M3 7.5L6 10.5L11 4" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                    </Svg>
                  </Pressable>
                </View>
                <Pressable onPress={() => router.push(`/task/${task.id}`)} style={styles.labels}>
                  <Text style={styles.taskTitle}>{task.emoji ? `${task.emoji} ${task.title}` : task.title}</Text>
                  <Text style={styles.taskRoom}>{roomLabel(task.roomId)}</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            {tasks.length === 0 ? t('home.noTasksTitle') : t('home.allClearTitle')}
          </Text>
          <Text style={styles.emptyText}>
            {tasks.length === 0 ? t('home.noTasksText') : t('home.allClearText')}
          </Text>
          {tasks.length === 0 && (
            <Pressable style={styles.quickStart} onPress={() => router.push('/quick-start')}>
              <Text style={styles.quickStartText}>{t('quickStart.cta')}</Text>
            </Pressable>
          )}
        </View>
      )}
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

  sectionLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 1,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 22 },
  gridItem: { width: '47%', alignItems: 'center', gap: 8 },
  circleWrap: { width: 122, height: 122 },
  doneBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.accent,
    borderWidth: 3,
    borderColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  labels: { alignItems: 'center', gap: 2 },
  taskTitle: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text, textAlign: 'center', lineHeight: 17 },
  taskRoom: { fontSize: 12, color: colors.muted, textAlign: 'center' },

  empty: {
    alignItems: 'center',
    paddingVertical: 28,
    paddingHorizontal: 20,
  },
  emptyTitle: { fontFamily: fonts.serif, fontSize: 22, color: colors.text, marginBottom: 6 },
  emptyText: { fontSize: 14, color: colors.muted2, textAlign: 'center', lineHeight: 20 },
  quickStart: {
    marginTop: 20,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
  },
  quickStartText: { fontSize: 15, fontFamily: fonts.bold, color: '#fff' },
});
