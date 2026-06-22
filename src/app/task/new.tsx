import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { RepeatPicker } from '@/components/RepeatPicker';
import { addTask, updateTask, useMembers, useRooms, useTask } from '@/lib/store';
import { colors, fonts, radii, withAlpha } from '@/theme';
import type { RepeatMode } from '@/types';

export default function TaskFormScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id?: string; roomId?: string }>();
  const rooms = useRooms();
  const members = useMembers();
  const editing = useTask(params.id);

  const [title, setTitle] = useState(editing?.title ?? '');
  const [roomId, setRoomId] = useState(editing?.roomId ?? params.roomId ?? rooms[0]?.id ?? '');
  const [mode, setMode] = useState<RepeatMode>(editing?.repeatMode ?? 'interval');
  const [intervalDays, setIntervalDays] = useState(editing?.intervalDays ?? 3);
  const [fixedWeekday, setFixedWeekday] = useState(editing?.fixedWeekday ?? 1);
  const [assigneeIds, setAssigneeIds] = useState<string[]>(editing?.assigneeIds ?? []);

  const canSave = title.trim().length > 0 && roomId.length > 0;
  const safeBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const toggleAssignee = (memberId: string) =>
    setAssigneeIds((ids) =>
      ids.includes(memberId) ? ids.filter((m) => m !== memberId) : [...ids, memberId]
    );

  const save = () => {
    if (!canSave) return;
    const payload = {
      roomId,
      title,
      repeatMode: mode,
      intervalDays: mode === 'interval' ? intervalDays : undefined,
      fixedWeekday: mode === 'fixed' ? fixedWeekday : undefined,
      assigneeIds,
    };
    if (editing) updateTask(editing.id, payload);
    else addTask(payload);
    safeBack();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={safeBack}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{editing ? t('add.titleEdit') : t('add.titleNew')}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder={t('add.namePlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.titleInput}
        />

        <Text style={styles.section}>{t('add.room')}</Text>
        <View style={styles.chips}>
          {rooms.map((room) => {
            const selected = room.id === roomId;
            return (
              <Pressable
                key={room.id}
                style={[styles.chip, selected ? styles.chipActive : styles.chipIdle]}
                onPress={() => setRoomId(room.id)}>
                <Text style={[styles.chipText, selected && styles.chipTextActive]}>{room.label}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.section}>{t('add.repeat')}</Text>
        <RepeatPicker
          mode={mode}
          onModeChange={setMode}
          intervalDays={intervalDays}
          onIntervalChange={setIntervalDays}
          fixedWeekday={fixedWeekday}
          onFixedWeekdayChange={setFixedWeekday}
        />

        <Text style={styles.section}>{t('add.assignee')}</Text>
        <View style={styles.memberChips}>
          {members.map((member) => {
            const selected = assigneeIds.includes(member.id);
            return (
              <Pressable
                key={member.id}
                style={[styles.memberChip, { borderColor: selected ? colors.accent : colors.line5 }]}
                onPress={() => toggleAssignee(member.id)}>
                <Avatar initial={member.initial} color={member.color} size={28} />
                <Text style={styles.memberName}>{member.name}</Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable style={[styles.saveBtn, { opacity: canSave ? 1 : 0.5 }]} onPress={save}>
          <Text style={styles.saveText}>{editing ? t('add.saveEdit') : t('add.save')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12 },
  cancel: { fontSize: 15, fontFamily: fonts.semibold, color: colors.muted3 },
  headerTitle: { fontFamily: fonts.serif, fontSize: 19, color: colors.text },

  body: { paddingHorizontal: 22, paddingBottom: 24 },
  titleInput: {
    borderBottomWidth: 2,
    borderBottomColor: colors.line4,
    paddingVertical: 12,
    paddingHorizontal: 2,
    fontSize: 20,
    fontFamily: fonts.serif,
    color: colors.text,
    marginBottom: 26,
  },
  section: { fontSize: 12, fontFamily: fonts.bold, letterSpacing: 0.7, color: colors.muted, marginBottom: 11 },

  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 26 },
  chip: { paddingVertical: 9, paddingHorizontal: 15, borderRadius: radii.pill, borderWidth: 1.5 },
  chipIdle: { borderColor: colors.line, backgroundColor: colors.surface },
  chipActive: { borderColor: colors.accent, backgroundColor: withAlpha(colors.accent, 0.12) },
  chipText: { fontSize: 13, fontFamily: fonts.semibold, color: colors.text },
  chipTextActive: { color: colors.accentDark },

  memberChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 30 },
  memberChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingRight: 14,
    paddingLeft: 8,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    backgroundColor: colors.surface,
  },
  memberName: { fontSize: 13, fontFamily: fonts.semibold, color: colors.text },

  footer: { paddingHorizontal: 22, paddingTop: 14, borderTopWidth: 1, borderTopColor: colors.line2, backgroundColor: colors.bg },
  saveBtn: { paddingVertical: 16, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: 'center' },
  saveText: { fontSize: 16, fontFamily: fonts.bold, color: '#fff' },
});
