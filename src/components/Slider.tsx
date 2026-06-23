import { useRef } from 'react';
import { type GestureResponderEvent, PanResponder, StyleSheet, View } from 'react-native';

import { colors, radii, shadow } from '@/theme';

interface Props {
  /** 0..1 */
  value: number;
  onChange: (value: number) => void;
  color?: string;
}

const THUMB = 26;

/**
 * Lightweight slider built on PanResponder (no native module, so no rebuild).
 * Position is read from the touch's locationX relative to the track.
 */
export function Slider({ value, onChange, color = colors.accent }: Props) {
  const widthRef = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const update = (e: GestureResponderEvent) => {
    const w = widthRef.current;
    if (!w) return;
    onChangeRef.current(Math.max(0, Math.min(1, e.nativeEvent.locationX / w)));
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: update,
      onPanResponderMove: update,
    })
  ).current;

  const pct = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` as const;

  return (
    <View
      style={styles.wrap}
      onLayout={(e) => (widthRef.current = e.nativeEvent.layout.width)}
      {...pan.panHandlers}>
      <View style={styles.track}>
        <View style={[styles.fill, { width: pct, backgroundColor: color }]} />
      </View>
      <View style={[styles.thumb, { left: pct, borderColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 44, justifyContent: 'center' },
  track: { height: 8, borderRadius: radii.pill, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: radii.pill },
  thumb: {
    position: 'absolute',
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    marginLeft: -THUMB / 2,
    top: (44 - THUMB) / 2,
    backgroundColor: colors.surface,
    borderWidth: 3,
    ...shadow.card,
  },
});
