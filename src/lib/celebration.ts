import { useSyncExternalStore } from 'react';

export interface CelebrationData {
  taskTitle: string;
  streak: number;
}

let current: CelebrationData | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export function celebrate(data: CelebrationData) {
  current = data;
  emit();
}

export function dismissCelebration() {
  current = null;
  emit();
}

export function useCelebration(): CelebrationData | null {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => current
  );
}
