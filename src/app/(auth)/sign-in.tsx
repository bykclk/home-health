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
              <View style={styles.content}>
                <AppleLogo />
                <Text style={styles.appleText}>{t('auth.continueApple')}</Text>
              </View>
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
            <View style={styles.content}>
              <GoogleLogo />
              <Text style={styles.googleText}>{t('auth.continueGoogle')}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function AppleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24">
      <Path
        fill="#fff"
        d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.74-1.517.03-2.01-.89-3.747-.89-1.737 0-2.282.86-3.728.92-1.42.06-2.51-1.45-3.467-2.78-1.94-2.79-3.43-7.9-1.434-11.36.99-1.71 2.766-2.8 4.704-2.83 1.45-.03 2.83.98 3.713.98.882 0 2.57-1.21 4.34-1.03.74.03 2.82.3 4.16 2.26-.107.07-2.48 1.45-2.45 4.33.03 3.44 3.02 4.59 3.05 4.61z"
      />
    </Svg>
  );
}

function GoogleLogo() {
  return (
    <Svg width={18} height={18} viewBox="0 0 48 48">
      <Path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <Path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <Path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <Path fill="#EA4335" d="M24 9.5c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 2.65 29.93 0 24 0 15.4 0 7.96 4.93 4.34 12.12l7.35 5.7C13.42 12.62 18.27 9.5 24 9.5z" />
    </Svg>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 28, justifyContent: 'space-between' },
  content: { flexDirection: 'row', alignItems: 'center', gap: 10 },
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
