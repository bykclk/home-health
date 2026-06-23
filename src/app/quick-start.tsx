import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { applyTemplate, useRooms } from '@/lib/data';
import { FREE_ROOM_LIMIT, useIsPremium } from '@/lib/premium';
import { TEMPLATES } from '@/lib/templates';
import { colors, fonts, radii, shadow } from '@/theme';

export default function QuickStartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const rooms = useRooms();
  const isPremium = useIsPremium();

  const maxSelectable = isPremium ? TEMPLATES.length : Math.max(0, FREE_ROOM_LIMIT - rooms.length);
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(TEMPLATES.slice(0, maxSelectable).map((r) => r.id))
  );

  const safeBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size >= maxSelectable) {
        router.push('/upgrade');
        return prev;
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const add = () => {
    const packs = TEMPLATES.filter((r) => selected.has(r.id)).map((r) => ({
      roomLabel: t(r.labelKey),
      tasks: r.tasks.map((tk) => ({ title: t(tk.titleKey), intervalDays: tk.intervalDays })),
    }));
    if (packs.length) applyTemplate(packs);
    safeBack();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={safeBack}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('quickStart.title')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.subtitle}>{t('quickStart.subtitle')}</Text>
        {TEMPLATES.map((room) => {
          const on = selected.has(room.id);
          return (
            <Pressable key={room.id} style={[styles.card, on && styles.cardOn]} onPress={() => toggle(room.id)}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text style={styles.roomLabel}>{t(room.labelKey)}</Text>
                <Text style={styles.tasks} numberOfLines={2}>
                  {room.tasks.map((tk) => t(tk.titleKey)).join(' · ')}
                </Text>
              </View>
              <View style={[styles.checkbox, on && styles.checkboxOn]}>
                {on && (
                  <Svg width={14} height={14} viewBox="0 0 14 14">
                    <Path d="M3 7.5L6 10.5L11 4" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </Svg>
                )}
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={[styles.add, { opacity: selected.size ? 1 : 0.4 }]} onPress={add}>
          <Text style={styles.addText}>{t('quickStart.add', { count: selected.size })}</Text>
        </Pressable>
      </View>
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

  body: { paddingHorizontal: 24, paddingBottom: 24 },
  subtitle: { fontSize: 14, color: colors.muted2, marginBottom: 20, lineHeight: 20 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 12,
    ...shadow.card,
  },
  cardOn: { borderColor: colors.accent },
  roomLabel: { fontFamily: fonts.serif, fontSize: 19, color: colors.text },
  tasks: { fontSize: 13, color: colors.muted, marginTop: 4, lineHeight: 18 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    borderWidth: 2,
    borderColor: colors.line5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.accent, borderColor: colors.accent },

  footer: { paddingHorizontal: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.line2 },
  add: { paddingVertical: 16, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: 'center' },
  addText: { fontSize: 16, fontFamily: fonts.bold, color: '#fff' },
});
