import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { StyleSheet, View } from 'react-native';
import Animated, {
  interpolateColor,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { colors, radii, shadow } from '@/theme';

interface Props {
  /** 0..1 */
  value: number;
  onChange: (value: number) => void;
}

const THUMB = 28;
const HEIGHT = 48;
const STOPS = [0, 0.5, 1];
const SCALE = [colors.fresh, colors.soon, colors.overdue];

/**
 * Smooth slider driven on the UI thread (gesture-handler + reanimated). The
 * thumb follows the finger and the fill grades green -> amber -> red with the
 * value; onChange fires when the drag settles. No native slider module.
 */
export function Slider({ value, onChange }: Props) {
  const width = useSharedValue(0);
  const pos = useSharedValue(value);

  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      'worklet';
      if (width.value > 0) pos.value = Math.max(0, Math.min(1, e.x / width.value));
    })
    .onUpdate((e) => {
      'worklet';
      if (width.value > 0) pos.value = Math.max(0, Math.min(1, e.x / width.value));
    })
    .onFinalize(() => {
      'worklet';
      runOnJS(onChange)(pos.value);
    });

  const fillStyle = useAnimatedStyle(() => ({
    width: pos.value * width.value,
    backgroundColor: interpolateColor(pos.value, STOPS, SCALE),
  }));
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pos.value * width.value - THUMB / 2 }],
    borderColor: interpolateColor(pos.value, STOPS, SCALE),
  }));

  return (
    <GestureDetector gesture={pan}>
      <View style={styles.wrap} onLayout={(e) => (width.value = e.nativeEvent.layout.width)}>
        <View style={styles.track}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: { height: HEIGHT, justifyContent: 'center' },
  track: { height: 8, borderRadius: radii.pill, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radii.pill },
  thumb: {
    position: 'absolute',
    left: 0,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    top: (HEIGHT - THUMB) / 2,
    backgroundColor: colors.surface,
    borderWidth: 3,
    ...shadow.card,
  },
});
