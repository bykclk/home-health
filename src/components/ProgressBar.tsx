import { StyleSheet, View } from 'react-native';

import { colors, radii } from '@/theme';

interface Props {
  /** 0..1 */
  value: number;
  color: string;
  height?: number;
  track?: string;
}

export function ProgressBar({ value, color, height = 6, track = colors.track }: Props) {
  const pct = `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%` as const;
  return (
    <View style={[styles.track, { height, backgroundColor: track }]}>
      <View style={{ width: pct, height: '100%', backgroundColor: color, borderRadius: radii.pill }} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { borderRadius: radii.pill, overflow: 'hidden' },
});
