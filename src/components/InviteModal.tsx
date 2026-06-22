import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, ZoomIn } from 'react-native-reanimated';

import type { Household } from '@/types';
import { colors, fonts, radii } from '@/theme';

interface Props {
  visible: boolean;
  household: Household;
  onClose: () => void;
}

export function InviteModal({ visible, household, onClose }: Props) {
  const { t } = useTranslation();

  const onShare = () => {
    Share.share({
      message: t('invite.shareMessage', { name: household.name, code: household.inviteCode }),
    });
  };

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View entering={FadeIn.duration(200)} style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View entering={ZoomIn.springify().damping(14)} style={styles.card}>
          <Text style={styles.title}>{t('invite.title')}</Text>
          <Text style={styles.subtitle}>{t('invite.subtitle')}</Text>

          <Text style={styles.codeLabel}>{t('invite.codeLabel')}</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code} selectable>
              {household.inviteCode}
            </Text>
          </View>

          <Pressable style={styles.shareBtn} onPress={onShare}>
            <Text style={styles.shareText}>{t('invite.share')}</Text>
          </Pressable>
          <Pressable style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>{t('common.close')}</Text>
          </Pressable>
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
  card: { backgroundColor: colors.bg, borderRadius: radii.xl, padding: 24, width: 320 },
  title: { fontFamily: fonts.serif, fontSize: 22, color: colors.text, marginBottom: 4 },
  subtitle: { fontSize: 13, color: colors.muted2, marginBottom: 20, lineHeight: 19 },
  codeLabel: {
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 0.7,
    color: colors.muted,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  codeBox: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderStyle: 'dashed',
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    paddingVertical: 18,
    alignItems: 'center',
    marginBottom: 22,
  },
  code: { fontFamily: fonts.serif, fontSize: 30, letterSpacing: 4, color: colors.text },
  shareBtn: {
    paddingVertical: 15,
    borderRadius: radii.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    marginBottom: 10,
  },
  shareText: { fontSize: 16, fontFamily: fonts.bold, color: '#fff' },
  closeBtn: { paddingVertical: 12, alignItems: 'center' },
  closeText: { fontSize: 14, fontFamily: fonts.semibold, color: colors.muted3 },
});
