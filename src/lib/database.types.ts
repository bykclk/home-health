/**
 * Hand-authored types mirroring supabase/schema.sql.
 * Regenerate with `supabase gen types typescript` once the CLI is linked.
 */

export interface ProfileRow {
  id: string;
  display_name: string;
  initial: string;
  color: string;
  created_at: string;
}

export interface HouseholdRow {
  id: string;
  name: string;
  invite_code: string;
  created_by: string | null;
  created_at: string;
}

export interface HouseholdMemberRow {
  household_id: string;
  user_id: string;
  role: 'owner' | 'member';
  color: string;
  joined_at: string;
}

export interface RoomRow {
  id: string;
  household_id: string;
  label: string;
  position: number;
  created_at: string;
}

export interface TaskRow {
  id: string;
  household_id: string;
  room_id: string;
  title: string;
  repeat_mode: 'interval' | 'fixed';
  interval_days: number | null;
  fixed_weekday: number | null;
  created_at: string;
}

export interface TaskAssigneeRow {
  task_id: string;
  user_id: string;
}

export interface CompletionRow {
  id: string;
  task_id: string;
  household_id: string;
  user_id: string | null;
  completed_at: string;
}

type Table<Row, Insert = Partial<Row>, Update = Partial<Row>> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: Table<ProfileRow, Omit<ProfileRow, 'created_at'>>;
      households: Table<HouseholdRow>;
      household_members: Table<HouseholdMemberRow, Omit<HouseholdMemberRow, 'joined_at' | 'color' | 'role'> & Partial<HouseholdMemberRow>>;
      rooms: Table<RoomRow, Omit<RoomRow, 'id' | 'created_at'>>;
      tasks: Table<TaskRow, Omit<TaskRow, 'id' | 'created_at'>>;
      task_assignees: Table<TaskAssigneeRow, TaskAssigneeRow>;
      completions: Table<CompletionRow, Omit<CompletionRow, 'id' | 'completed_at'> & { completed_at?: string }>;
    };
    Views: Record<string, never>;
    Functions: {
      create_household: { Args: { p_name: string }; Returns: HouseholdRow };
      join_household: { Args: { p_code: string }; Returns: HouseholdRow };
      is_household_member: { Args: { hid: string }; Returns: boolean };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
