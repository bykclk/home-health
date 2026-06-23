import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, radii } from '@/theme';

interface Props {
  /** 0..1 */
  value: number;
  color: string;
  height?: number;
  track?: string;
}

export function ProgressBar({ value, color, height = 6, track = colors.track }: Props) {
  const clamped = Math.max(0, Math.min(1, value));
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(clamped, { duration: 600, easing: Easing.out(Easing.cubic) });
  }, [clamped, w]);
  const fillStyle = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));

  return (
    <View style={[styles.track, { height, backgroundColor: track }]}>
      <Animated.View style={[{ height: '100%', backgroundColor: color, borderRadius: radii.pill }, fillStyle]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: radii.pill, overflow: 'hidden' },
});
