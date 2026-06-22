import { BlurView } from 'expo-blur';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radii, shadow } from '@/theme';

const LABEL_KEYS: Record<string, string> = {
  index: 'tabs.home',
  rooms: 'tabs.rooms',
  stats: 'tabs.stats',
  members: 'tabs.house',
};

// Minimal shape of the React Navigation tab bar props we use, to avoid a
// direct @react-navigation/bottom-tabs type dependency.
interface TabRoute {
  key: string;
  name: string;
}
interface TabBarProps {
  state: { index: number; routes: TabRoute[] };
  navigation: {
    emit: (e: { type: 'tabPress'; target: string; canPreventDefault: boolean }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

/** Simple bordered geometric glyphs, matching the source design. */
function TabIcon({ name, color }: { name: string; color: string }) {
  const radius =
    name === 'rooms' ? 999 : name === 'index' ? 6 : name === 'members' ? 5 : 4;
  return <View style={[styles.icon, { borderColor: color, borderRadius: radius }]} />;
}

export function TabBar({ state, navigation }: TabBarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // Split the four routes around the center "+" button.
  const left = state.routes.slice(0, 2);
  const right = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[number]) => {
    const index = state.routes.findIndex((r) => r.key === route.key);
    const focused = state.index === index;
    const color = focused ? colors.accent : colors.muted;
    const onPress = () => {
      const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
      if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
    };
    return (
      <Pressable key={route.key} style={styles.tab} onPress={onPress}>
        <TabIcon name={route.name} color={color} />
        <Text style={[styles.label, { color }]}>{t(LABEL_KEYS[route.name] ?? route.name)}</Text>
      </Pressable>
    );
  };

  return (
    <BlurView intensity={28} tint="light" style={[styles.bar, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {left.map(renderTab)}
        <Pressable style={styles.addButton} onPress={() => router.push('/task/new')}>
          <View style={styles.addCircle}>
            <Text style={styles.addPlus}>+</Text>
          </View>
        </Pressable>
        {right.map(renderTab)}
      </View>
    </BlurView>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: 'rgba(243,242,234,0.94)',
    borderTopWidth: 1,
    borderTopColor: colors.line2,
  },
  row: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    paddingTop: 12,
  },
  tab: { alignItems: 'center', gap: 5, width: 64 },
  icon: { width: 18, height: 18, borderWidth: 2 },
  label: { fontSize: 10, fontFamily: fonts.bold },
  addButton: { marginTop: -6 },
  addCircle: {
    width: 50,
    height: 50,
    borderRadius: radii.pill,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.raised,
  },
  addPlus: { color: '#fff', fontSize: 30, fontWeight: '300', lineHeight: 34 },
});
