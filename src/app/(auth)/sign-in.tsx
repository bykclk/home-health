import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useAuth } from '@/lib/auth';
import { colors, fonts, radii } from '@/theme';

export default function SignInScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { appleAvailable, signInWithApple, signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState<null | 'apple' | 'google'>(null);

  const run = async (provider: 'apple' | 'google', fn: () => Promise<void>) => {
    try {
      setBusy(provider);
      await fn();
    } catch (e: any) {
      if (e?.code !== 'ERR_REQUEST_CANCELED' && e?.message !== 'Sign in action cancelled') {
        Alert.alert('Sign-in failed', e?.message ?? 'Please try again.');
      }
    } finally {
      setBusy(null);
    }
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 28 }]}>
      <View style={styles.hero}>
        <View style={styles.badge}>
          <Svg width={40} height={40} viewBox="0 0 14 14">
            <Path d="M3 7.5L6 10.5L11 4" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text style={styles.title}>Home Health</Text>
        <Text style={styles.tagline}>{t('auth.tagline')}</Text>
      </View>

      <View style={styles.actions}>
        {appleAvailable && (
          <Pressable
            style={[styles.button, styles.apple]}
            disabled={busy !== null}
            onPress={() => run('apple', signInWithApple)}>
            {busy === 'apple' ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.appleText}>{t('auth.continueApple')}</Text>
            )}
          </Pressable>
        )}
        <Pressable
          style={[styles.button, styles.google]}
          disabled={busy !== null}
          onPress={() => run('google', signInWithGoogle)}>
          {busy === 'google' ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <Text style={styles.googleText}>{t('auth.continueGoogle')}</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 28, justifyContent: 'space-between' },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  badge: {
    width: 88,
    height: 88,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: { fontFamily: fonts.serif, fontSize: 34, color: colors.text },
  tagline: { fontSize: 15, color: colors.muted2, marginTop: 10, textAlign: 'center', lineHeight: 21 },

  actions: { gap: 12 },
  button: { height: 54, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  apple: { backgroundColor: colors.frame },
  appleText: { color: '#fff', fontSize: 16, fontFamily: fonts.bold },
  google: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
  googleText: { color: colors.text, fontSize: 16, fontFamily: fonts.bold },
});
