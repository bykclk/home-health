/**
 * Premium entitlement state. Currently a local, persisted flag so we can build
 * and test the free/premium gates; in the monetization stage RevenueCat drives
 * it by calling setPremium(entitlement.isActive).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';

/** Free tier limits. */
export const FREE_ROOM_LIMIT = 3;
export const FREE_MEMBER_LIMIT = 1; // solo — inviting others is premium

const KEY = 'premium.active';

let active = false;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

// Hydrate from storage on startup.
AsyncStorage.getItem(KEY).then((v) => {
  if (v === '1' && !active) {
    active = true;
    emit();
  }
});

export function useIsPremium(): boolean {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => active
  );
}

export function isPremiumNow(): boolean {
  return active;
}

export async function setPremium(value: boolean): Promise<void> {
  active = value;
  emit();
  try {
    await AsyncStorage.setItem(KEY, value ? '1' : '0');
  } catch {
    // best-effort persistence
  }
}
