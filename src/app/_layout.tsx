import {
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_600SemiBold,
  HankenGrotesk_700Bold,
  useFonts,
} from '@expo-google-fonts/hanken-grotesk';
import { Newsreader_500Medium } from '@expo-google-fonts/newsreader';
import { QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Celebration } from '@/components/Celebration';
import { AuthProvider, useAuth } from '@/lib/auth';
import { USE_MOCK } from '@/lib/config';
import { loadStoredLanguage } from '@/lib/i18n';
import { queryClient } from '@/lib/queryClient';
import { useRealtimeSync } from '@/lib/realtime';
import { fetchActiveHousehold } from '@/lib/remote';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_600SemiBold,
    HankenGrotesk_700Bold,
    Newsreader_500Medium,
  });

  useEffect(() => {
    loadStoredLanguage();
  }, []);

  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <StatusBar style="dark" />
            <RootNavigator />
            <Celebration />
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator() {
  const { session, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  const householdQuery = useQuery({
    queryKey: ['household'],
    queryFn: fetchActiveHousehold,
    enabled: !USE_MOCK && !!session,
  });

  useRealtimeSync(USE_MOCK ? undefined : householdQuery.data?.id);

  // Open the task when a reminder notification is tapped.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const openTask = (taskId: unknown) => {
      if (typeof taskId === 'string') router.push(`/task/${taskId}`);
    };
    Notifications.getLastNotificationResponseAsync().then((r) =>
      openTask(r?.notification.request.content.data?.taskId)
    );
    const sub = Notifications.addNotificationResponseReceivedListener((r) =>
      openTask(r.notification.request.content.data?.taskId)
    );
    return () => sub.remove();
  }, [router]);

  useEffect(() => {
    if (USE_MOCK || loading) return;
    const root = segments[0];
    const inAuth = root === '(auth)';
    const inOnboarding = root === '(onboarding)';

    if (!session) {
      if (!inAuth) router.replace('/(auth)/sign-in');
      return;
    }
    if (householdQuery.isLoading) return;
    if (!householdQuery.data) {
      if (!inOnboarding) router.replace('/(onboarding)/household');
      return;
    }
    if (inAuth || inOnboarding) router.replace('/(tabs)');
  }, [session, loading, householdQuery.isLoading, householdQuery.data, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="task/[id]" options={{ presentation: 'modal' }} />
      <Stack.Screen name="task/new" options={{ presentation: 'modal' }} />
      <Stack.Screen name="profile" options={{ presentation: 'modal' }} />
      <Stack.Screen name="household" options={{ presentation: 'modal' }} />
      <Stack.Screen name="upgrade" options={{ presentation: 'modal' }} />
      <Stack.Screen name="quick-start" options={{ presentation: 'modal' }} />
      <Stack.Screen name="achievements" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
