/**
 * Supabase-backed data layer. Mirrors the shape of lib/store.ts (same hook
 * names, same return types) so screens are agnostic to the source; lib/data.ts
 * picks between this and the mock store based on USE_MOCK.
 */
import { useQuery } from '@tanstack/react-query';

import { initialBaselineISO } from '@/lib/health';
import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';
import type { Household, Member, Profile, Room, Task } from '@/types';
import type { TaskInput } from '@/lib/store';

const EMPTY_HOUSEHOLD: Household = { id: '', name: '', inviteCode: '' };

// --- Fetchers ------------------------------------------------------------

export async function fetchActiveHousehold(): Promise<Household | null> {
  const { data, error } = await supabase
    .from('household_members')
    .select('households(id, name, invite_code)')
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  const h = data?.households as unknown as
    | { id: string; name: string; invite_code: string }
    | undefined;
  return h ? { id: h.id, name: h.name, inviteCode: h.invite_code } : null;
}

async function fetchMembers(householdId: string): Promise<Member[]> {
  // Two queries instead of a PostgREST embed: household_members.user_id and
  // profiles.id both reference auth.users, with no direct FK between them, so
  // `profiles(...)` can't be embedded. Fetch both and join in JS.
  const { data: rows, error } = await supabase
    .from('household_members')
    .select('user_id, role, color')
    .eq('household_id', householdId)
    .order('joined_at', { ascending: true });
  if (error) throw error;
  const members = rows ?? [];

  const ids = members.map((m) => m.user_id);
  const profiles: Record<string, any> = {};
  if (ids.length) {
    const { data: profs } = await supabase
      .from('profiles')
      .select('id, display_name, initial, color')
      .in('id', ids);
    for (const p of profs ?? []) profiles[p.id] = p;
  }

  return members.map((m: any) => {
    const p = profiles[m.user_id];
    return {
      id: m.user_id,
      name: p?.display_name || '—',
      initial: p?.initial || '?',
      // Profile color is the source of truth (what the profile editor sets);
      // fall back to the per-household color, then the default.
      color: p?.color || m.color || '#4a754c',
      roleKey: m.role === 'owner' ? 'members.roleOwner' : 'members.roleMember',
    };
  });
}

async function fetchRooms(householdId: string): Promise<Room[]> {
  const { data, error } = await supabase
    .from('rooms')
    .select('id, label, position')
    .eq('household_id', householdId)
    .order('position', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => ({ id: r.id, label: r.label, position: r.position }));
}

async function fetchTasks(householdId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select(
      'id, room_id, title, repeat_mode, interval_days, fixed_weekday, created_at, task_assignees(user_id), completions(completed_at)'
    )
    .eq('household_id', householdId);
  if (error) throw error;
  return (data ?? []).map((t: any) => ({
    id: t.id,
    roomId: t.room_id,
    title: t.title,
    repeatMode: t.repeat_mode,
    intervalDays: t.interval_days ?? undefined,
    fixedWeekday: t.fixed_weekday ?? undefined,
    assigneeIds: (t.task_assignees ?? []).map((a: any) => a.user_id),
    completions: (t.completions ?? []).map((c: any) => c.completed_at),
    createdAt: t.created_at,
  }));
}

// --- Selectors (hooks) ---------------------------------------------------

function useHouseholdQuery() {
  return useQuery({ queryKey: ['household'], queryFn: fetchActiveHousehold });
}

export function useHousehold(): Household {
  return useHouseholdQuery().data ?? EMPTY_HOUSEHOLD;
}

export function useMembers(): Member[] {
  const householdId = useHouseholdQuery().data?.id;
  const { data } = useQuery({
    queryKey: ['members', householdId],
    queryFn: () => fetchMembers(householdId!),
    enabled: !!householdId,
  });
  return data ?? [];
}

export function useRooms(): Room[] {
  const householdId = useHouseholdQuery().data?.id;
  const { data } = useQuery({
    queryKey: ['rooms', householdId],
    queryFn: () => fetchRooms(householdId!),
    enabled: !!householdId,
  });
  return data ?? [];
}

export function useTasks(): Task[] {
  const householdId = useHouseholdQuery().data?.id;
  const { data } = useQuery({
    queryKey: ['tasks', householdId],
    queryFn: () => fetchTasks(householdId!),
    enabled: !!householdId,
  });
  return data ?? [];
}

export function useTask(id?: string): Task | undefined {
  return useTasks().find((t) => t.id === id);
}

// --- Mutations -----------------------------------------------------------

function currentHouseholdId(): string | undefined {
  return queryClient.getQueryData<Household | null>(['household'])?.id;
}

async function currentUserId(): Promise<string | undefined> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id;
}

function invalidateTasks() {
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
}

export async function completeTask(taskId: string) {
  const householdId = currentHouseholdId();
  const userId = await currentUserId();
  const { error } = await supabase
    .from('completions')
    .insert({ task_id: taskId, household_id: householdId!, user_id: userId ?? null });
  if (error) throw error;
  invalidateTasks();
}

export async function uncompleteTask(taskId: string) {
  const { data } = await supabase
    .from('completions')
    .select('id')
    .eq('task_id', taskId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (data?.id) {
    const { error } = await supabase.from('completions').delete().eq('id', data.id);
    if (error) throw error;
  }
  invalidateTasks();
}

export async function addTask(input: TaskInput): Promise<void> {
  const householdId = currentHouseholdId();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      household_id: householdId!,
      room_id: input.roomId,
      title: input.title.trim(),
      repeat_mode: input.repeatMode,
      interval_days: input.intervalDays ?? null,
      fixed_weekday: input.fixedWeekday ?? null,
      created_at: initialBaselineISO(input),
    })
    .select('id')
    .single();
  if (error) throw error;
  if (input.assigneeIds.length) {
    await supabase
      .from('task_assignees')
      .insert(input.assigneeIds.map((userId) => ({ task_id: data.id, user_id: userId })));
  }
  invalidateTasks();
}

export async function updateTask(id: string, patch: Partial<TaskInput>) {
  const { error } = await supabase
    .from('tasks')
    .update({
      ...(patch.roomId !== undefined ? { room_id: patch.roomId } : {}),
      ...(patch.title !== undefined ? { title: patch.title.trim() } : {}),
      ...(patch.repeatMode !== undefined ? { repeat_mode: patch.repeatMode } : {}),
      interval_days: patch.repeatMode === 'interval' ? patch.intervalDays ?? null : null,
      fixed_weekday: patch.repeatMode === 'fixed' ? patch.fixedWeekday ?? null : null,
    })
    .eq('id', id);
  if (error) throw error;
  if (patch.assigneeIds) {
    await supabase.from('task_assignees').delete().eq('task_id', id);
    if (patch.assigneeIds.length) {
      await supabase
        .from('task_assignees')
        .insert(patch.assigneeIds.map((userId) => ({ task_id: id, user_id: userId })));
    }
  }
  invalidateTasks();
}

export async function deleteTask(id: string) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
  invalidateTasks();
}

export async function addRoom(label: string): Promise<void> {
  const householdId = currentHouseholdId();
  const rooms = queryClient.getQueryData<Room[]>(['rooms', householdId]) ?? [];
  const { error } = await supabase
    .from('rooms')
    .insert({ household_id: householdId!, label: label.trim(), position: rooms.length });
  if (error) throw error;
  queryClient.invalidateQueries({ queryKey: ['rooms'] });
}

export async function deleteRoom(id: string) {
  const { error } = await supabase.from('rooms').delete().eq('id', id);
  if (error) throw error;
  queryClient.invalidateQueries({ queryKey: ['rooms'] });
  invalidateTasks();
}

// --- Onboarding ----------------------------------------------------------

/** Map a `households` RPC row into the cache and prime related queries. */
function adoptHousehold(data: any) {
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.id) return;
  const household: Household = { id: row.id, name: row.name, inviteCode: row.invite_code };
  // Write straight into the cache so the routing gate redirects immediately,
  // without waiting on a refetch round-trip.
  queryClient.setQueryData(['household'], household);
  queryClient.invalidateQueries({ queryKey: ['members'] });
  queryClient.invalidateQueries({ queryKey: ['rooms'] });
  queryClient.invalidateQueries({ queryKey: ['tasks'] });
}

export async function createHousehold(name: string): Promise<void> {
  const { data, error } = await supabase.rpc('create_household', { p_name: name.trim() });
  if (error) throw error;
  adoptHousehold(data);
}

export async function joinHousehold(code: string): Promise<void> {
  const { data, error } = await supabase.rpc('join_household', { p_code: code.trim() });
  if (error) throw error;
  adoptHousehold(data);
}

// --- Profile -------------------------------------------------------------

export async function getMyProfile(): Promise<Profile | null> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, initial, color')
    .eq('id', uid)
    .maybeSingle();
  if (error) throw error;
  return data
    ? { id: data.id, displayName: data.display_name, initial: data.initial, color: data.color }
    : null;
}

export async function updateProfile(input: { displayName: string; color: string }): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) return;
  const name = input.displayName.trim();
  const initial = (name[0] || 'H').toUpperCase();
  const { error } = await supabase
    .from('profiles')
    .update({ display_name: name, initial, color: input.color })
    .eq('id', uid);
  if (error) throw error;
  queryClient.invalidateQueries({ queryKey: ['members'] });
}
