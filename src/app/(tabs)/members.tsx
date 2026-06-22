import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { InviteModal } from '@/components/InviteModal';
import { MemberRow } from '@/components/MemberRow';
import { useAuth } from '@/lib/auth';
import { setAppLanguage, SUPPORTED_LANGUAGES } from '@/lib/i18n';
import { useHousehold, useMembers, useTasks } from '@/lib/data';
import { colors, fonts, radii } from '@/theme';

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export default function MembersScreen() {
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const household = useHousehold();
  const members = useMembers();
  const tasks = useTasks();
  const { signOut } = useAuth();
  const [inviteVisible, setInviteVisible] = useState(false);

  const confirmSignOut = () =>
    Alert.alert(t('members.signOutConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('members.signOut'), style: 'destructive', onPress: () => signOut() },
    ]);

  // Attribute recent completions to a task's primary assignee.
  const since = Date.now() - WEEK_MS;
  const counts: Record<string, number> = {};
  for (const task of tasks) {
    const owner = task.assigneeIds[0];
    if (!owner) continue;
    const recent = task.completions.filter((c) => Date.parse(c) >= since).length;
    counts[owner] = (counts[owner] ?? 0) + recent;
  }
  const maxCount = Math.max(1, ...Object.values(counts));

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingHorizontal: 22, paddingBottom: 28 }}
      showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{household.name}</Text>
        <View style={styles.langSwitch}>
          {SUPPORTED_LANGUAGES.map((lng) => {
            const active = i18n.language.startsWith(lng);
            return (
              <Pressable
                key={lng}
                style={[styles.langChip, active && styles.langChipActive]}
                onPress={() => setAppLanguage(lng)}>
                <Text style={[styles.langText, active && styles.langTextActive]}>{lng.toUpperCase()}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Text style={styles.subtitle}>{t('members.subtitle', { count: members.length })}</Text>

      {members.map((member) => (
        <MemberRow
          key={member.id}
          member={member}
          count={counts[member.id] ?? 0}
          barValue={(counts[member.id] ?? 0) / maxCount}
        />
      ))}

      <Pressable
        style={styles.invite}
        onPress={() => setInviteVisible(true)}
        disabled={!household.inviteCode}>
        <Text style={styles.inviteText}>{t('members.invite')}</Text>
      </Pressable>

      <Pressable style={styles.signOut} onPress={confirmSignOut}>
        <Text style={styles.signOutText}>{t('members.signOut')}</Text>
      </Pressable>

      <InviteModal
        visible={inviteVisible}
        household={household}
        onClose={() => setInviteVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.text },
  langSwitch: { flexDirection: 'row', backgroundColor: colors.track, borderRadius: radii.pill, padding: 3 },
  langChip: { paddingVertical: 5, paddingHorizontal: 11, borderRadius: radii.pill },
  langChipActive: { backgroundColor: colors.surface },
  langText: { fontSize: 12, fontFamily: fonts.bold, color: colors.muted },
  langTextActive: { color: colors.accent },
  subtitle: { fontSize: 13, color: colors.muted, marginTop: 4, marginBottom: 22 },

  invite: {
    marginTop: 12,
    paddingVertical: 15,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.line6,
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  inviteText: { fontSize: 15, fontFamily: fonts.bold, color: colors.accentDark },

  signOut: { marginTop: 18, paddingVertical: 12, alignItems: 'center' },
  signOutText: { fontSize: 15, fontFamily: fonts.bold, color: colors.danger },
});
