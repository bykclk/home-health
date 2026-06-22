import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import type { DayBucket } from '@/lib/health';
import { colors, fonts } from '@/theme';

interface Props {
  data: DayBucket[];
  height?: number;
}

export function WeekBars({ data, height = 110 }: Props) {
  const { i18n } = useTranslation();
  const fmt = new Intl.DateTimeFormat(i18n.language, { weekday: 'short' });
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <View style={[styles.row, { height }]}>
      {data.map((d) => {
        const barH = Math.max(6, (d.count / max) * (height - 24));
        return (
          <View key={d.date} style={styles.col}>
            <View style={[styles.bar, { height: barH }]} />
            <Text style={styles.label}>{fmt.format(new Date(d.date)).slice(0, 2)}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  col: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', height: '100%', gap: 7 },
  bar: { width: '100%', maxWidth: 22, borderRadius: 6, backgroundColor: colors.accent },
  label: { fontSize: 10, fontFamily: fonts.semibold, color: colors.muted },
});
