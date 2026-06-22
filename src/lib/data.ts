/**
 * Single entry point for app data. Picks the in-memory seed store or the
 * Supabase-backed layer once, at module load, based on USE_MOCK. Because the
 * choice is a stable module constant, the selected hooks are called
 * unconditionally on every render (Rules of Hooks hold).
 */
import { USE_MOCK } from '@/lib/config';
import * as mock from '@/lib/store';
import * as remote from '@/lib/remote';

const impl = USE_MOCK ? mock : remote;

// Selectors
export const useHousehold = impl.useHousehold;
export const useMembers = impl.useMembers;
export const useRooms = impl.useRooms;
export const useTasks = impl.useTasks;
export const useTask = impl.useTask;

// Mutations
export const completeTask = impl.completeTask;
export const uncompleteTask = impl.uncompleteTask;
export const addTask = impl.addTask;
export const updateTask = impl.updateTask;
export const deleteTask = impl.deleteTask;
export const addRoom = impl.addRoom;
export const deleteRoom = impl.deleteRoom;

// Onboarding
export const createHousehold = impl.createHousehold;
export const joinHousehold = impl.joinHousehold;

export type { TaskInput } from '@/lib/store';
