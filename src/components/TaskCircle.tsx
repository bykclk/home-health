import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PressableScale } from '@/components/PressableScale';
import { colors, fonts } from '@/theme';
import type { TaskState } from '@/types';

interface Props {
  size: number;
  state: TaskState;
  /** Show the big number + label inside the circle. */
  showText?: boolean;
  onPress?: () => void;
}

export function TaskCircle({ size, state, showText = false, onPress }: Props) {
  const { t } = useTranslation();
  const fillFraction = Math.max(0, Math.min(1, state.progress));
  const targetHeight = size * fillFraction;

  const height = useSharedValue(0);
  useEffect(() => {
    height.value = withTiming(targetHeight, {
      duration: 650,
      easing: Easing.bezier(0.4, 0, 0.2, 1),
    });
  }, [targetHeight, height]);

  const fillStyle = useAnimatedStyle(() => ({ height: height.value }));

  const Wrapper = onPress ? PressableScale : View;

  return (
    <Wrapper onPress={onPress} style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Animated.View
        style={[
          styles.fill,
          fillStyle,
          { backgroundColor: state.fillWash, borderTopColor: state.fillColor },
        ]}
      />
      {showText && (
        <View style={[StyleSheet.absoluteFill, styles.center]}>
          <Text style={[styles.number, { color: state.fillColor, fontSize: size * 0.18 }]}>
            {state.dueShort}
          </Text>
          <Text style={[styles.label, { color: state.fillColor, fontSize: size * 0.085 }]}>
            {t(state.fillLabelKey)}
          </Text>
        </View>
      )}
    </Wrapper>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 2,
  },
  center: { alignItems: 'center', justifyContent: 'center' },
  number: { fontFamily: fonts.serif, lineHeight: undefined },
  label: { fontFamily: fonts.bold, marginTop: 3 },
});
