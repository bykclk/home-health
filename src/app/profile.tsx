import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Avatar } from '@/components/Avatar';
import { getMyProfile, updateProfile } from '@/lib/data';
import { avatarColors, colors, fonts, radii } from '@/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [color, setColor] = useState(avatarColors[0]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getMyProfile().then((p) => {
      if (!p) return;
      setName(p.displayName);
      if (p.color) setColor(p.color);
    });
  }, []);

  const safeBack = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const initial = (name.trim()[0] || '?').toUpperCase();
  const canSave = name.trim().length > 0 && !saving;

  const save = async () => {
    if (!canSave) return;
    try {
      setSaving(true);
      await updateProfile({ displayName: name, color });
      safeBack();
    } catch (e: any) {
      Alert.alert('Something went wrong', e?.message ?? 'Please try again.');
      setSaving(false);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={safeBack}>
          <Text style={styles.cancel}>{t('common.cancel')}</Text>
        </Pressable>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <Pressable onPress={save} disabled={!canSave}>
          <Text style={[styles.save, { opacity: canSave ? 1 : 0.4 }]}>{t('common.save')}</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.preview}>
          <Avatar initial={initial} color={color} size={88} />
        </View>

        <Text style={styles.label}>{t('profile.name')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('profile.namePlaceholder')}
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoFocus
        />

        <Text style={[styles.label, { marginTop: 28 }]}>{t('profile.color')}</Text>
        <View style={styles.swatches}>
          {avatarColors.map((c) => (
            <Pressable key={c} onPress={() => setColor(c)} style={styles.swatchWrap}>
              <View style={[styles.swatch, { backgroundColor: c }]}>
                {c === color && <View style={styles.swatchDot} />}
              </View>
            </Pressable>
          ))}
        </View>
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
  save: { fontSize: 15, fontFamily: fonts.bold, color: colors.accentDark },

  body: { paddingHorizontal: 24, paddingTop: 12 },
  preview: { alignItems: 'center', marginBottom: 28 },
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
  swatches: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  swatchWrap: { padding: 2 },
  swatch: { width: 44, height: 44, borderRadius: radii.pill, alignItems: 'center', justifyContent: 'center' },
  swatchDot: { width: 14, height: 14, borderRadius: radii.pill, backgroundColor: '#fff' },
});
