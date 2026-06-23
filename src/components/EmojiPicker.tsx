import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { colors, radii, withAlpha } from '@/theme';

const ROOM_EMOJIS = ['🍳', '🛁', '🛋️', '🛏️', '🚿', '🚽', '🧺', '🪴', '🚪', '🏠', '🍽️', '💻', '🚗', '🪟'];
const TASK_EMOJIS = ['🧽', '🧴', '🗑️', '🧹', '🪣', '🚿', '🛏️', '🍽️', '🪟', '🧺', '🚽', '🪥', '🧼', '✨'];

interface Props {
  value?: string;
  onChange: (emoji: string | undefined) => void;
  palette?: 'room' | 'task';
}

export function EmojiPicker({ value, onChange, palette = 'room' }: Props) {
  const list = palette === 'task' ? TASK_EMOJIS : ROOM_EMOJIS;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}>
      {list.map((e) => {
        const on = value === e;
        return (
          <Pressable
            key={e}
            style={[styles.item, on && styles.itemOn]}
            onPress={() => onChange(on ? undefined : e)}>
            <Text style={styles.emoji}>{e}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: 8, paddingVertical: 2 },
  item: {
    width: 48,
    height: 48,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemOn: { borderColor: colors.accent, backgroundColor: withAlpha(colors.accent, 0.12) },
  emoji: { fontSize: 24 },
});
