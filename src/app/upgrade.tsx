import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { setPremium, useIsPremium } from '@/lib/premium';
import { colors, fonts, radii } from '@/theme';

const BENEFITS = [
  'upgrade.benefitRooms',
  'upgrade.benefitSharing',
  'upgrade.benefitStats',
  'upgrade.benefitReminders',
] as const;

function Check() {
  return (
    <View style={styles.check}>
      <Svg width={14} height={14} viewBox="0 0 14 14">
        <Path d="M3 7.5L6 10.5L11 4" stroke="#fff" strokeWidth={2.2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </View>
  );
}

export default function UpgradeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isPremium = useIsPremium();

  const safeBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  // TODO: replace with a RevenueCat purchase in the monetization stage.
  const onUpgrade = async () => {
    await setPremium(true);
    safeBack();
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 8 }]}>
      <View style={styles.topBar}>
        <Pressable onPress={safeBack}>
          <Text style={styles.close}>✕</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.badge}>
          <Svg width={40} height={40} viewBox="0 0 14 14">
            <Path d="M3 7.5L6 10.5L11 4" stroke="#fff" strokeWidth={2} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
        <Text style={styles.title}>{t('upgrade.title')}</Text>
        <Text style={styles.subtitle}>{t('upgrade.subtitle')}</Text>

        <View style={styles.benefits}>
          {BENEFITS.map((key) => (
            <View key={key} style={styles.benefitRow}>
              <Check />
              <Text style={styles.benefitText}>{t(key)}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {isPremium ? (
          <View style={styles.activePill}>
            <Text style={styles.activeText}>{t('upgrade.active')}</Text>
          </View>
        ) : (
          <>
            <Pressable style={styles.cta} onPress={onUpgrade}>
              <Text style={styles.ctaText}>{t('upgrade.cta')}</Text>
            </Pressable>
            <Text style={styles.note}>{t('upgrade.note')}</Text>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  topBar: { paddingHorizontal: 22, alignItems: 'flex-start' },
  close: { fontSize: 20, color: colors.muted3 },

  body: { paddingHorizontal: 28, paddingTop: 20, alignItems: 'center' },
  badge: {
    width: 84,
    height: 84,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontFamily: fonts.serif, fontSize: 30, color: colors.text, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.muted2, marginTop: 8, marginBottom: 30, textAlign: 'center', lineHeight: 21 },

  benefits: { alignSelf: 'stretch', gap: 16 },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  check: {
    width: 26,
    height: 26,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { flex: 1, fontSize: 16, fontFamily: fonts.semibold, color: colors.text },

  footer: { paddingHorizontal: 24, paddingTop: 12 },
  cta: { paddingVertical: 16, borderRadius: radii.md, backgroundColor: colors.accent, alignItems: 'center' },
  ctaText: { fontSize: 16, fontFamily: fonts.bold, color: '#fff' },
  note: { fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 10 },
  activePill: {
    paddingVertical: 16,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.track,
    alignItems: 'center',
  },
  activeText: { fontSize: 16, fontFamily: fonts.bold, color: colors.accentDark },
});
