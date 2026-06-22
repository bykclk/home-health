import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import { colors, fonts, radii } from '@/theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onAdd: (label: string) => void;
}

export function NewRoomModal({ visible, onClose, onAdd }: Props) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue('');
    onClose();
  };

  const close = () => {
    setValue('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={close}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={close} />
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.card}>
          <Text style={styles.title}>{t('newRoom.title')}</Text>
          <Text style={styles.subtitle}>{t('newRoom.subtitle')}</Text>
          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={t('newRoom.placeholder')}
            placeholderTextColor={colors.muted}
            style={styles.input}
            autoFocus
            onSubmitEditing={submit}
            returnKeyType="done"
          />
          <View style={styles.actions}>
            <Pressable style={styles.cancelBtn} onPress={close}>
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </Pressable>
            <Pressable style={[styles.addBtn, { opacity: value.trim() ? 1 : 0.5 }]} onPress={submit}>
              <Text style={styles.addText}>{t('common.add')}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(44,48,37,0.34)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: { backgroundColor: colors.bg, borderRadius: radii.xl, padding: 24, width: 300 },
  title: { fontFamily: fonts.serif, fontSize: 22, color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.muted3, marginBottom: 16 },
  input: {
    borderBottomWidth: 2,
    borderBottomColor: colors.line4,
    paddingVertical: 10,
    paddingHorizontal: 2,
    fontSize: 19,
    fontFamily: fonts.serif,
    color: colors.text,
    marginBottom: 22,
  },
  actions: { flexDirection: 'row', gap: 10 },
  cancelBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, borderColor: colors.line5, alignItems: 'center' },
  cancelText: { fontSize: 15, fontFamily: fonts.bold, color: colors.muted2 },
  addBtn: { flex: 1, paddingVertical: 13, borderRadius: 14, backgroundColor: colors.accent, alignItems: 'center' },
  addText: { fontSize: 15, fontFamily: fonts.bold, color: '#fff' },
});
