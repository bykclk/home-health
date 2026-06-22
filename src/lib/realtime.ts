import { useEffect } from 'react';

import { queryClient } from '@/lib/queryClient';
import { supabase } from '@/lib/supabase';

/**
 * Subscribe to this household's changes and invalidate the matching queries so
 * every member's app stays in sync. No-op when householdId is undefined.
 */
export function useRealtimeSync(householdId?: string) {
  useEffect(() => {
    if (!householdId) return;
    const filter = `household_id=eq.${householdId}`;
    const bump = (key: string) => () => queryClient.invalidateQueries({ queryKey: [key] });

    const channel = supabase
      .channel(`household:${householdId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter }, bump('tasks'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions', filter }, bump('tasks'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rooms', filter }, bump('rooms'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'household_members', filter }, bump('members'))
      // task_assignees has no household_id; a change there should still refresh tasks.
      .on('postgres_changes', { event: '*', schema: 'public', table: 'task_assignees' }, bump('tasks'))
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId]);
}
