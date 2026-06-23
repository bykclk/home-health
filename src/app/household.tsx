import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { useAuth } from '@/lib/auth';
import { leaveHousehold, removeMember, renameHousehold, useHousehold, useMembers } from '@/lib/data';
import { colors, fonts, radii, shadow } from '@/theme';

export default function HouseholdSettingsScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const household = useHousehold();
  const members = useMembers();

  const myId = session?.user?.id;
  const isOwner = members.find((m) => m.id === myId)?.roleKey === 'members.roleOwner';

  const [name, setName] = useState(household.name);
  const safeBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const changed = isOwner && name.trim().length > 0 && name.trim() !== household.name;

  const save = () => {
    if (changed) renameHousehold(name);
    safeBack();
  };

  const confirmRemove = (id: string, memberName: string) =>
    Alert.alert(t('household.removeConfirm', { name: memberName }), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('household.remove'), style: 'destructive', onPress: () => removeMember(id) },
    ]);

  const confirmLeave = () =>
    Alert.alert(t('household.leaveConfirm'), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('household.leave'),
        style: 'destructive',
        onPress: async () => {
          await leaveHousehold();
          safeBack();
        },
      },
    ]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={safeBack}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('household.title')}</Text>
        {isOwner ? (
          <Pressable onPress={save} disabled={!changed}>
            <Text style={[styles.save, { opacity: changed ? 1 : 0.4 }]}>{t('common.save')}</Text>
          </Pressable>
        ) : (
          <View style={{ width: 44 }} />
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>{t('household.name')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          editable={isOwner}
          placeholder={t('onboarding.namePlaceholder')}
          placeholderTextColor={colors.muted}
          style={[styles.input, !isOwner && { color: colors.muted2 }]}
        />

        <Text style={[styles.label, { marginTop: 30 }]}>{t('household.members')}</Text>
        {members.map((member) => (
          <View key={member.id} style={styles.row}>
            <Avatar initial={member.initial} color={member.color} size={40} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={styles.name}>
                {member.name}
                {member.id === myId ? ` · ${t('household.you')}` : ''}
              </Text>
              {member.roleKey && <Text style={styles.role}>{t(member.roleKey)}</Text>}
            </View>
            {isOwner && member.id !== myId && (
              <Pressable onPress={() => confirmRemove(member.id, member.name)}>
                <Text style={styles.remove}>{t('household.remove')}</Text>
              </Pressable>
            )}
          </View>
        ))}

        <Pressable style={styles.leave} onPress={confirmLeave}>
          <Text style={styles.leaveText}>{t('household.leave')}</Text>
        </Pressable>
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
  save: { fontSize: 15, fontFamily: fonts.bold, color: colors.accentDark },

  body: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28 },
  label: { fontSize: 12, fontFamily: fonts.bold, letterSpacing: 0.7, color: colors.muted, marginBottom: 11 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: colors.line4,
    paddingVertical: 12,
    paddingHorizontal: 2,
    fontSize: 22,
    fontFamily: fonts.serif,
    color: colors.text,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 14,
    marginBottom: 10,
    ...shadow.card,
  },
  name: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  role: { fontSize: 12, color: colors.muted, marginTop: 1 },
  remove: { fontSize: 14, fontFamily: fonts.bold, color: colors.danger },

  leave: { marginTop: 24, paddingVertical: 15, alignItems: 'center', borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.danger },
  leaveText: { fontSize: 15, fontFamily: fonts.bold, color: colors.danger },
});
