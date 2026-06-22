import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WEEKDAYS_MON_FIRST, weekdayShort } from '@/lib/format';
import { colors, fonts, radii } from '@/theme';
import type { RepeatMode } from '@/types';

interface Props {
  mode: RepeatMode;
  onModeChange: (mode: RepeatMode) => void;
  intervalDays: number;
  onIntervalChange: (days: number) => void;
  fixedWeekday: number;
  onFixedWeekdayChange: (weekday: number) => void;
}

export function RepeatPicker({
  mode,
  onModeChange,
  intervalDays,
  onIntervalChange,
  fixedWeekday,
  onFixedWeekdayChange,
}: Props) {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <View style={styles.toggle}>
        <Pressable
          style={[styles.toggleItem, mode === 'interval' && styles.toggleActive]}
          onPress={() => onModeChange('interval')}>
          <Text style={[styles.toggleText, mode === 'interval' && styles.toggleTextActive]}>
            {t('add.modeInterval')}
          </Text>
        </Pressable>
        <Pressable
          style={[styles.toggleItem, mode === 'fixed' && styles.toggleActive]}
          onPress={() => onModeChange('fixed')}>
          <Text style={[styles.toggleText, mode === 'fixed' && styles.toggleTextActive]}>
            {t('add.modeFixed')}
          </Text>
        </Pressable>
      </View>

      {mode === 'interval' ? (
        <View style={styles.card}>
          <Text style={styles.hint}>{t('add.intervalHint')}</Text>
          <View style={styles.stepperRow}>
            <Pressable
              style={styles.stepBtn}
              onPress={() => onIntervalChange(Math.max(1, intervalDays - 1))}>
              <Text style={styles.stepSign}>−</Text>
            </Pressable>
            <View style={styles.stepValueWrap}>
              <Text style={styles.stepValue}>{intervalDays}</Text>
              <Text style={styles.stepUnit}>{t('add.intervalUnit')}</Text>
            </View>
            <Pressable
              style={styles.stepBtn}
              onPress={() => onIntervalChange(Math.min(60, intervalDays + 1))}>
              <Text style={styles.stepSign}>+</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={[styles.hint, { textAlign: 'center' }]}>{t('add.weeklyHint')}</Text>
          <View style={styles.weekRow}>
            {WEEKDAYS_MON_FIRST.map((wd) => {
              const selected = wd === fixedWeekday;
              return (
                <Pressable
                  key={wd}
                  style={[styles.weekChip, selected && styles.weekChipActive]}
                  onPress={() => onFixedWeekdayChange(wd)}>
                  <Text style={styles.weekChipText}>{weekdayShort(wd, i18n.language).slice(0, 2)}</Text>
                  {selected && <View style={styles.weekChipDot} />}
                </Pressable>
              );
            })}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.track,
    borderRadius: radii.sm,
    padding: 4,
    marginBottom: 16,
  },
  toggleItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 9 },
  toggleActive: { backgroundColor: colors.surface },
  toggleText: { fontSize: 13, fontFamily: fonts.bold, color: colors.muted },
  toggleTextActive: { color: colors.text },

  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 18,
    marginBottom: 26,
  },
  hint: { fontSize: 13, color: colors.muted, marginBottom: 14, textAlign: 'center' },

  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 22 },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.line6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepSign: { fontSize: 24, color: colors.text },
  stepValueWrap: { flexDirection: 'row', alignItems: 'baseline' },
  stepValue: { fontFamily: fonts.serif, fontSize: 40, color: colors.text },
  stepUnit: { fontSize: 14, color: colors.muted, marginLeft: 6 },

  weekRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 5 },
  weekChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 11,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  weekChipActive: { borderColor: colors.accent },
  weekChipText: { fontSize: 12, fontFamily: fonts.bold, color: colors.text },
  weekChipDot: {
    height: 3,
    width: 16,
    marginTop: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
  },
});
