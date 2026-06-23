import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProgressBar } from '@/components/ProgressBar';
import { WeekBars } from '@/components/WeekBars';
import { homeHealth, last7Days, roomScore, scoreColor, streak, total } from '@/lib/health';
import { useRooms, useTasks } from '@/lib/data';
import { colors, fonts, radii, shadow } from '@/theme';

export default function StatsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const rooms = useRooms();
  const tasks = useTasks();

  const score = homeHealth(tasks);
  const week = last7Days(tasks);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>{t('stats.title')}</Text>

      <View style={styles.statRow}>
        <View style={[styles.statCard, styles.statAccent]}>
          <Text style={[styles.statNum, { color: colors.onAccent }]}>{score}%</Text>
          <Text style={[styles.statLabel, { color: colors.onAccent, opacity: 0.85 }]}>{t('stats.homeHealth')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{streak(tasks)}</Text>
          <Text style={styles.statLabel}>{t('stats.streakLabel')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNum}>{total(tasks)}</Text>
          <Text style={styles.statLabel}>{t('stats.total')}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{t('stats.last7')}</Text>
        <WeekBars data={week} />
      </View>

      <View style={styles.panel}>
        <Text style={[styles.panelTitle, { marginBottom: 6 }]}>{t('stats.roomCleanliness')}</Text>
        {rooms.map((room) => {
          const pct = roomScore(tasks.filter((tk) => tk.roomId === room.id));
          return (
            <View key={room.id} style={styles.roomRow}>
              <View style={styles.roomRowHeader}>
                <Text style={styles.roomLabel}>{room.emoji ? `${room.emoji} ${room.label}` : room.label}</Text>
                <Text style={styles.roomPct}>{pct}%</Text>
              </View>
              <ProgressBar value={pct / 100} color={scoreColor(pct)} height={7} />
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.text, marginBottom: 18 },

  statRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 15,
    ...shadow.card,
  },
  statAccent: { backgroundColor: colors.accent, borderColor: colors.accent },
  statNum: { fontFamily: fonts.serif, fontSize: 26, color: colors.text, lineHeight: 28 },
  statLabel: { fontSize: 11, color: colors.muted, fontFamily: fonts.semibold, marginTop: 5 },

  panel: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.lg,
    padding: 18,
    marginBottom: 16,
    ...shadow.card,
  },
  panelTitle: { fontSize: 13, fontFamily: fonts.bold, color: colors.text, marginBottom: 16 },

  roomRow: { marginVertical: 8 },
  roomRowHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  roomLabel: { color: colors.text, fontFamily: fonts.semibold, fontSize: 12.5 },
  roomPct: { color: colors.muted, fontSize: 12.5 },
});
