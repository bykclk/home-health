import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth';
import { createHousehold, joinHousehold } from '@/lib/data';
import { colors, fonts, radii } from '@/theme';

type Mode = 'create' | 'join';

export default function HouseholdScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const [mode, setMode] = useState<Mode>('create');
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);

  const value = mode === 'create' ? name : code;
  const canSubmit = value.trim().length > 0 && !busy;

  const submit = async () => {
    if (!canSubmit) return;
    try {
      setBusy(true);
      if (mode === 'create') await createHousehold(name);
      else await joinHousehold(code);
      // The household query is invalidated inside the action; the root gate
      // will redirect to the tabs once it refetches.
    } catch (e: any) {
      Alert.alert('Something went wrong', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <Text style={styles.title}>{t('onboarding.title')}</Text>

      <View style={styles.toggle}>
        <Pressable
          style={[styles.toggleItem, mode === 'create' && styles.toggleActive]}
          onPress={() => setMode('create')}>
          <Text style={[styles.toggleText, mode === 'create' && styles.toggleTextActive]}>
            {t('onboarding.createTitle')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleItem, mode === 'join' && styles.toggleActive]}
          onPress={() => setMode('join')}>
          <Text style={[styles.toggleText, mode === 'join' && styles.toggleTextActive]}>
            {t('onboarding.joinTitle')}
          </Text>
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        {mode === 'create' ? t('onboarding.createSubtitle') : t('onboarding.joinSubtitle')}
      </Text>

      {mode === 'create' ? (
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('onboarding.namePlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoFocus
        />
      ) : (
        <TextInput
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase())}
          placeholder={t('onboarding.codePlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCapitalize="characters"
          autoFocus
        />
      )}

      <Pressable style={[styles.submit, { opacity: canSubmit ? 1 : 0.5 }]} onPress={submit}>
        {busy ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>
            {mode === 'create' ? t('onboarding.create') : t('onboarding.join')}
          </Text>
        )}
      </Pressable>

      <Pressable style={styles.signOut} onPress={() => signOut()}>
        <Text style={styles.signOutText}>{t('common.cancel')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.text, marginBottom: 20 },
  toggle: { flexDirection: 'row', backgroundColor: colors.track, borderRadius: radii.sm, padding: 4, marginBottom: 16 },
  toggleItem: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 9 },
  toggleActive: { backgroundColor: colors.surface },
  toggleText: { fontSize: 14, fontFamily: fonts.bold, color: colors.muted },
  toggleTextActive: { color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted2, marginBottom: 22, lineHeight: 20 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: colors.line4,
    paddingVertical: 12,
    paddingHorizontal: 2,
    fontSize: 22,
    fontFamily: fonts.serif,
    color: colors.text,
    marginBottom: 30,
  },
  submit: { height: 54, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  submitText: { color: '#fff', fontSize: 16, fontFamily: fonts.bold },
  signOut: { alignItems: 'center', marginTop: 18 },
  signOutText: { fontSize: 14, fontFamily: fonts.semibold, color: colors.muted3 },
});
