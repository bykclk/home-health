-- Let a household owner remove other members. The existing members_delete
-- policy only allows deleting your own membership (leaving); this adds an
-- owner-scoped delete. is_household_owner is SECURITY DEFINER to avoid RLS
-- recursion, mirroring is_household_member.

create or replace function public.is_household_owner(hid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.household_members
    where household_id = hid and user_id = auth.uid() and role = 'owner'
  );
$$;

grant execute on function public.is_household_owner(uuid) to authenticated;

drop policy if exists members_delete_owner on public.household_members;
create policy members_delete_owner on public.household_members for delete
  using (public.is_household_owner(household_id));
