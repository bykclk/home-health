import { StyleSheet, Text, View } from 'react-native';

import { fonts } from '@/theme';

interface Props {
  initial: string;
  color: string;
  size?: number;
}

export function Avatar({ initial, color, size = 44 }: Props) {
  return (
    <View
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color },
      ]}>
      <Text style={[styles.initial, { fontSize: size * 0.4 }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#fff', fontFamily: fonts.bold },
});
