import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { dismissCelebration, useCelebration } from '@/lib/celebration';
import { colors, fonts, radii } from '@/theme';

const { width } = Dimensions.get('window');

export function Celebration() {
  const { t } = useTranslation();
  const data = useCelebration();
  const cannon = useRef(null);

  // Auto-dismiss so the flow stays smooth; tapping still closes it early.
  useEffect(() => {
    if (!data) return;
    const id = setTimeout(dismissCelebration, 1600);
    return () => clearTimeout(id);
  }, [data]);

  if (!data) return null;

  return (
    <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(280)} style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={dismissCelebration} />
      <ConfettiCannon
        ref={cannon}
        count={120}
        origin={{ x: width / 2, y: -20 }}
        fadeOut
        autoStart
        colors={[colors.accent, colors.soon, colors.danger, '#3b6ea5', '#9a5ba6']}
      />
      <Animated.View entering={ZoomIn.springify().damping(12)} style={styles.card}>
        <View style={styles.check}>
          <Svg width={38} height={38} viewBox="0 0 14 14">
            <Path
              d="M3 7.5L6 10.5L11 4"
              stroke="#fff"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={styles.title}>{t('celebration.title')}</Text>
        <Text style={styles.subtitle}>{t('celebration.subtitle', { title: data.taskTitle })}</Text>
        <View style={styles.streak}>
          <View style={styles.streakDot} />
          <Text style={styles.streakText}>{t('home.streak', { count: data.streak })}</Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 40,
    backgroundColor: colors.scrim,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: colors.bg,
    borderRadius: radii.xl,
    paddingVertical: 36,
    paddingHorizontal: 30,
    alignItems: 'center',
    width: 284,
  },
  check: {
    width: 78,
    height: 78,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: { fontFamily: fonts.serif, fontSize: 28, color: colors.text },
  subtitle: { fontSize: 14, color: colors.muted2, marginTop: 6, lineHeight: 20, textAlign: 'center' },
  streak: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
  streakDot: { width: 9, height: 9, borderRadius: 2, backgroundColor: colors.onAccent, transform: [{ rotate: '45deg' }] },
  streakText: { fontSize: 13, fontFamily: fonts.bold, color: colors.onAccent },
});
