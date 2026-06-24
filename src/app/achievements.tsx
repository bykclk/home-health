import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { computeAchievements } from '@/lib/achievements';
import { useMembers, useRooms, useTasks } from '@/lib/data';
import { colors, fonts, radii, shadow, withAlpha } from '@/theme';

export default function AchievementsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const tasks = useTasks();
  const rooms = useRooms();
  const members = useMembers();

  const items = computeAchievements(tasks, rooms, members);
  const unlockedCount = items.filter((i) => i.unlocked).length;
  const safeBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={safeBack}>
          <Text style={styles.cancel}>{t('common.close')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('achievements.title')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>
          {t('achievements.count', { unlocked: unlockedCount, total: items.length })}
        </Text>
        <View style={styles.grid}>
          {items.map((a) => (
            <View key={a.id} style={[styles.card, a.unlocked && styles.cardOn]}>
              <Text style={[styles.emoji, !a.unlocked && styles.emojiLocked]}>{a.emoji}</Text>
              <Text style={[styles.title, !a.unlocked && styles.dim]} numberOfLines={1}>
                {t(`achievements.items.${a.id}.title`)}
              </Text>
              <Text style={styles.desc} numberOfLines={2}>
                {t(`achievements.items.${a.id}.desc`, { goal: a.goal })}
              </Text>
              {a.unlocked ? (
                <Text style={styles.unlocked}>{t('achievements.unlocked')}</Text>
              ) : (
                <View style={styles.progressRow}>
                  <View style={styles.track}>
                    <View style={[styles.fill, { width: `${a.progress * 100}%` }]} />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.min(a.value, a.goal)}/{a.goal}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 12,
  },
  cancel: { fontSize: 15, fontFamily: fonts.semibold, color: colors.muted3 },
  headerTitle: { fontFamily: fonts.serif, fontSize: 19, color: colors.text },

  body: { paddingHorizontal: 22, paddingBottom: 28 },
  subtitle: { fontSize: 14, color: colors.muted2, marginBottom: 18 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 14 },
  card: {
    width: '47.5%',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.lg,
    padding: 16,
    minHeight: 150,
    ...shadow.card,
  },
  cardOn: { borderColor: colors.accent, backgroundColor: withAlpha(colors.accent, 0.08) },
  emoji: { fontSize: 34, marginBottom: 10 },
  emojiLocked: { opacity: 0.35 },
  title: { fontSize: 15, fontFamily: fonts.bold, color: colors.text },
  dim: { color: colors.muted2 },
  desc: { fontSize: 12, color: colors.muted, marginTop: 3, lineHeight: 16, flex: 1 },
  unlocked: { fontSize: 12, fontFamily: fonts.bold, color: colors.accentDark, marginTop: 8 },
  progressRow: { marginTop: 8 },
  track: { height: 6, borderRadius: radii.pill, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radii.pill, backgroundColor: colors.muted },
  progressText: { fontSize: 11, fontFamily: fonts.semibold, color: colors.muted, marginTop: 5 },
});
