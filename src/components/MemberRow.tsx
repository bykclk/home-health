import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { ProgressBar } from '@/components/ProgressBar';
import { colors, fonts, radii, shadow } from '@/theme';
import type { Member } from '@/types';

interface Props {
  member: Member;
  count: number;
  /** 0..1 share of the week's completions. */
  barValue: number;
}

export function MemberRow({ member, count, barValue }: Props) {
  const { t } = useTranslation();
  return (
    <View style={styles.card}>
      <Avatar initial={member.initial} color={member.color} size={44} />
      <View style={styles.info}>
        <Text style={styles.name}>{member.name}</Text>
        {member.roleKey && <Text style={styles.role}>{t(member.roleKey)}</Text>}
        <View style={styles.bar}>
          <ProgressBar value={barValue} color={member.color} />
        </View>
      </View>
      <View style={styles.count}>
        <Text style={styles.countNum}>{count}</Text>
        <Text style={styles.countLabel}>{t('members.thisWeek')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radii.md,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    ...shadow.card,
  },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontFamily: fonts.bold, color: colors.text },
  role: { fontSize: 12, color: colors.muted, marginTop: 1 },
  bar: { marginTop: 8 },
  count: { alignItems: 'center' },
  countNum: { fontFamily: fonts.serif, fontSize: 20, color: colors.text },
  countLabel: { fontSize: 10, color: colors.muted, fontFamily: fonts.semibold },
});
