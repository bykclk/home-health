/**
 * Lightweight in-memory store backing the UI with seed data.
 * Uses useSyncExternalStore so any screen re-renders on mutation, with no
 * provider. In Phase 6 this is replaced by React Query + Supabase; screens
 * consume the hooks below so the swap stays localized.
 */
import { useSyncExternalStore } from 'react';

import { initialBaselineISO } from '@/lib/health';
import { household, members, rooms as seedRooms, tasks as seedTasks } from '@/lib/mock';
import type { Household, Member, Profile, Room, Task } from '@/types';

interface State {
  household: Household;
  members: Member[];
  rooms: Room[];
  tasks: Task[];
}

let state: State = {
  household,
  members,
  rooms: [...seedRooms],
  tasks: [...seedTasks],
};

const listeners = new Set<() => void>();

function emit() {
  state = { ...state };
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

let idCounter = 1000;
const nextId = (prefix: string) => `${prefix}_${++idCounter}`;

// --- Selectors -----------------------------------------------------------

export function useHousehold(): Household {
  return useSyncExternalStore(subscribe, () => state.household);
}
export function useMembers(): Member[] {
  return useSyncExternalStore(subscribe, () => state.members);
}
export function useRooms(): Room[] {
  return useSyncExternalStore(subscribe, () => state.rooms);
}
export function useTasks(): Task[] {
  return useSyncExternalStore(subscribe, () => state.tasks);
}
export function useTask(id?: string): Task | undefined {
  const tasks = useTasks();
  return tasks.find((t) => t.id === id);
}

// --- Actions -------------------------------------------------------------

export interface TaskInput {
  roomId: string;
  title: string;
  repeatMode: Task['repeatMode'];
  intervalDays?: number;
  fixedWeekday?: number;
  assigneeIds: string[];
  /** Starting dirtiness for a new task, 0 (clean) .. 1 (due now). */
  dirtiness?: number;
}

export function completeTask(id: string) {
  state.tasks = state.tasks.map((t) =>
    t.id === id ? { ...t, completions: [new Date().toISOString(), ...t.completions] } : t
  );
  emit();
}

export function uncompleteTask(id: string) {
  state.tasks = state.tasks.map((t) => {
    if (t.id !== id || !t.completions.length) return t;
    const sorted = [...t.completions].sort((a, b) => Date.parse(b) - Date.parse(a));
    sorted.shift();
    return { ...t, completions: sorted };
  });
  emit();
}

export function addTask(input: TaskInput): Task {
  const task: Task = {
    id: nextId('t'),
    roomId: input.roomId,
    title: input.title.trim(),
    repeatMode: input.repeatMode,
    intervalDays: input.intervalDays,
    fixedWeekday: input.fixedWeekday,
    assigneeIds: input.assigneeIds,
    completions: [],
    createdAt: initialBaselineISO(input),
  };
  state.tasks = [...state.tasks, task];
  emit();
  return task;
}

export function updateTask(id: string, patch: Partial<TaskInput>) {
  state.tasks = state.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
  emit();
}

export function deleteTask(id: string) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  emit();
}

export function addRoom(label: string): Room {
  const room: Room = { id: nextId('r'), label: label.trim(), position: state.rooms.length };
  state.rooms = [...state.rooms, room];
  emit();
  return room;
}

export function deleteRoom(id: string) {
  state.rooms = state.rooms.filter((r) => r.id !== id);
  state.tasks = state.tasks.filter((t) => t.roomId !== id);
  emit();
}

// Onboarding is bypassed in mock mode; these exist only so lib/data.ts can
// reference the same surface for both backends.
export async function createHousehold(_name: string): Promise<void> {}
export async function joinHousehold(_code: string): Promise<void> {}

export function renameHousehold(name: string) {
  state.household = { ...state.household, name: name.trim() };
  emit();
}

export function removeMember(userId: string) {
  state.members = state.members.filter((m) => m.id !== userId);
  emit();
}

export async function leaveHousehold(): Promise<void> {
  // No-op in mock mode (there is no auth gate to fall back to).
}

// In mock mode the first seed member stands in for the current user.
export async function getMyProfile(): Promise<Profile | null> {
  const me = state.members[0];
  return me ? { id: me.id, displayName: me.name, initial: me.initial, color: me.color } : null;
}

export async function updateProfile(input: { displayName: string; color: string }): Promise<void> {
  const me = state.members[0];
  if (!me) return;
  const name = input.displayName.trim();
  const initial = (name[0] || 'H').toUpperCase();
  state.members = state.members.map((m) =>
    m.id === me.id ? { ...m, name, initial, color: input.color } : m
  );
  emit();
}
