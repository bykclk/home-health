import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { setPremium, useIsPremium } from '@/lib/premium';
import { getPackages, purchase, PURCHASES_ENABLED, restore } from '@/lib/purchases';
import { colors, fonts, radii, withAlpha } from '@/theme';

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
  const [packages, setPackages] = useState<any[]>([]);
  const [loadingPkgs, setLoadingPkgs] = useState(PURCHASES_ENABLED);
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!PURCHASES_ENABLED) return;
    getPackages()
      .then((p) => setPackages(p))
      .catch(() => {})
      .finally(() => setLoadingPkgs(false));
  }, []);

  const safeBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const onUpgrade = async () => {
    // Web or a dev build without RevenueCat keys: unlock locally for testing only.
    // In a real build we must NEVER grant premium without an actual purchase.
    if (!PURCHASES_ENABLED) {
      await setPremium(true);
      safeBack();
      return;
    }
    if (loadingPkgs) return; // products still loading; ignore the tap
    if (!packages.length) {
      Alert.alert(t('upgrade.unavailable'));
      return;
    }
    try {
      setBusy(true);
      const ok = await purchase(packages[selected]);
      if (ok) safeBack();
    } catch (e: any) {
      Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const onRestore = async () => {
    try {
      setBusy(true);
      const ok = await restore();
      if (ok) safeBack();
      else Alert.alert(t('upgrade.restoreNone'));
    } catch (e: any) {
      Alert.alert('Restore failed', e?.message ?? 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const price = packages[selected]?.product?.priceString;

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

        {!isPremium && packages.length > 1 && (
          <View style={styles.plans}>
            {packages.map((pkg, i) => {
              const on = i === selected;
              return (
                <Pressable
                  key={pkg.identifier}
                  style={[styles.plan, on ? styles.planOn : styles.planOff]}
                  onPress={() => setSelected(i)}>
                  <Text style={styles.planPeriod}>{pkg.packageType}</Text>
                  <Text style={styles.planPrice}>{pkg.product?.priceString}</Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        {isPremium ? (
          <View style={styles.activePill}>
            <Text style={styles.activeText}>{t('upgrade.active')}</Text>
          </View>
        ) : (
          <>
            <Pressable style={styles.cta} onPress={onUpgrade} disabled={busy || loadingPkgs}>
              {busy || loadingPkgs ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.ctaText}>{price ? `${t('upgrade.cta')} · ${price}` : t('upgrade.cta')}</Text>
              )}
            </Pressable>
            {PURCHASES_ENABLED ? (
              <Pressable onPress={onRestore} disabled={busy} style={styles.restoreBtn}>
                <Text style={styles.restore}>{t('upgrade.restore')}</Text>
              </Pressable>
            ) : (
              <Text style={styles.note}>{t('upgrade.note')}</Text>
            )}
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

  plans: { alignSelf: 'stretch', flexDirection: 'row', gap: 10, marginTop: 26 },
  plan: { flex: 1, borderRadius: radii.md, borderWidth: 1.5, padding: 14, alignItems: 'center' },
  planOff: { borderColor: colors.line, backgroundColor: colors.surface },
  planOn: { borderColor: colors.accent, backgroundColor: withAlpha(colors.accent, 0.1) },
  planPeriod: { fontSize: 12, fontFamily: fonts.bold, color: colors.muted, textTransform: 'capitalize' },
  planPrice: { fontSize: 18, fontFamily: fonts.bold, color: colors.text, marginTop: 4 },

  restoreBtn: { paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  restore: { fontSize: 14, fontFamily: fonts.semibold, color: colors.muted2 },

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
