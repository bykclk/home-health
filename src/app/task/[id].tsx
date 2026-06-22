import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { Avatar } from '@/components/Avatar';
import { TaskCircle } from '@/components/TaskCircle';
import { celebrate } from '@/lib/celebration';
import { relativeWhen, repeatLabel } from '@/lib/format';
import { streak, taskState } from '@/lib/health';
import { completeTask, deleteTask, uncompleteTask, useMembers, useRooms, useTask, useTasks } from '@/lib/data';
import { colors, fonts, radii } from '@/theme';

export default function TaskDetailScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const task = useTask(id);
  const tasks = useTasks();
  const rooms = useRooms();
  const members = useMembers();

  const safeBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!task) return null;

  const state = taskState(task);
  const room = rooms.find((r) => r.id === task.roomId);
  const assignees = members.filter((m) => task.assigneeIds.includes(m.id));
  const history = [...task.completions].sort((a, b) => Date.parse(b) - Date.parse(a)).slice(0, 8);

  const onComplete = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeTask(task.id);
    celebrate({ taskTitle: task.title, streak: streak(tasks) + (state.done ? 0 : 1) });
    safeBack();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <Pressable style={styles.back} onPress={safeBack}>
          <Text style={styles.chevron}>‹</Text>
          <Text style={styles.backText}>{t('common.back')}</Text>
        </Pressable>
        <View style={styles.topActions}>
          <Pressable onPress={() => router.replace({ pathname: '/task/new', params: { id: task.id } })}>
            <Text style={styles.edit}>{t('common.edit')}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              safeBack();
              deleteTask(task.id);
            }}>
            <Text style={styles.delete}>{t('common.delete')}</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <TaskCircle size={150} state={state} showText />
          <Text style={styles.title}>{task.title}</Text>
          {room && (
            <View style={styles.roomChip}>
              <Text style={styles.roomChipText}>{room.label}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Row label={t('detail.repeat')} value={repeatLabel(task, t, i18n.language)} />
          <Divider />
          <Row label={t('detail.status')} value={t(`task.status.${state.level}`)} />
          <Divider />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>{t('detail.assignee')}</Text>
            <View style={styles.avatars}>
              {assignees.map((m) => (
                <Avatar key={m.id} initial={m.initial} color={m.color} size={26} />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>{t('detail.history')}</Text>
            <Text style={styles.historyCount}>{t('detail.countText', { count: task.completions.length })}</Text>
          </View>
          {history.map((c, i) => (
            <View key={i} style={styles.historyRow}>
              <View style={styles.historyCheck}>
                <Svg width={11} height={11} viewBox="0 0 14 14">
                  <Path d="M3 7.5L6 10.5L11 4" stroke="#fff" strokeWidth={2.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              </View>
              <Text style={styles.historyWhen}>{t('detail.doneOn', { when: relativeWhen(c, i18n.language) })}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {state.done ? (
          <Pressable style={styles.undoBtn} onPress={() => uncompleteTask(task.id)}>
            <Text style={styles.undoText}>{t('detail.undo')}</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.completeBtn} onPress={onComplete}>
            <Text style={styles.completeText}>{t('detail.complete')}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 22 },
  back: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  chevron: { fontSize: 24, color: colors.muted3, lineHeight: 26 },
  backText: { fontSize: 14, fontFamily: fonts.semibold, color: colors.muted3 },
  topActions: { flexDirection: 'row', gap: 18, alignItems: 'center' },
  edit: { fontSize: 14, fontFamily: fonts.bold, color: colors.accentDark },
  delete: { fontSize: 14, fontFamily: fonts.semibold, color: colors.danger },

  body: { paddingHorizontal: 24, paddingBottom: 24 },
  hero: { alignItems: 'center', marginBottom: 24 },
  title: { fontFamily: fonts.serif, fontSize: 26, color: colors.text, marginTop: 18, textAlign: 'center' },
  roomChip: {
    marginTop: 10,
    paddingVertical: 6,
    paddingHorizontal: 13,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  roomChipText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.text },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 14,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: colors.muted },
  rowValue: { fontSize: 14, fontFamily: fonts.semibold, color: colors.text },
  divider: { height: 1, backgroundColor: colors.line3, marginVertical: 4 },
  avatars: { flexDirection: 'row', gap: 5 },

  historyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  historyTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.text },
  historyCount: { fontSize: 12, fontFamily: fonts.semibold, color: colors.accentDark },
  historyRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line3 },
  historyCheck: { width: 20, height: 20, borderRadius: radii.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  historyWhen: { fontSize: 13, color: colors.text },

  footer: { paddingHorizontal: 24, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line2 },
  completeBtn: { paddingVertical: 16, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: 'center' },
  completeText: { fontSize: 16, fontFamily: fonts.bold, color: '#fff' },
  undoBtn: { paddingVertical: 16, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.line6, backgroundColor: colors.track, alignItems: 'center' },
  undoText: { fontSize: 16, fontFamily: fonts.bold, color: colors.accentDark },
});
