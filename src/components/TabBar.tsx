import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect } from 'react-native-svg';

import { PressableScale } from '@/components/PressableScale';
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

/** Outline icons per tab: health (heart), rooms (grid), stats (bars), house. */
function TabIcon({ name, color }: { name: string; color: string }) {
  const stroke = {
    stroke: color,
    strokeWidth: 1.9,
    fill: 'none' as const,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={23} height={23} viewBox="0 0 24 24">
      {name === 'index' && (
        <Path
          {...stroke}
          d="M12 21.3l-1.45-1.32C5.4 15.3 2 12.24 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.74-3.4 6.8-8.55 11.48L12 21.3z"
        />
      )}
      {name === 'rooms' && (
        <>
          <Rect {...stroke} x={3.5} y={3.5} width={7} height={7} rx={1.8} />
          <Rect {...stroke} x={13.5} y={3.5} width={7} height={7} rx={1.8} />
          <Rect {...stroke} x={3.5} y={13.5} width={7} height={7} rx={1.8} />
          <Rect {...stroke} x={13.5} y={13.5} width={7} height={7} rx={1.8} />
        </>
      )}
      {name === 'stats' && (
        <>
          <Path {...stroke} strokeWidth={1.5} d="M4 20.2h16" />
          <Path {...stroke} strokeWidth={2.4} d="M7.5 20v-6.5M12 20V9M16.5 20V5.5" />
        </>
      )}
      {name === 'members' && (
        <Path {...stroke} d="M3.5 11.5 12 4.5l8.5 7M5.6 9.9V20h12.8V9.9M9.7 20v-5.2h4.6V20" />
      )}
    </Svg>
  );
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
        <PressableScale
          style={styles.addButton}
          scaleTo={0.88}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/task/new');
          }}>
          <View style={styles.addCircle}>
            <Text style={styles.addPlus}>+</Text>
          </View>
        </PressableScale>
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
