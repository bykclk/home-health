-- In-app account deletion (required by the App Store for apps with accounts).
-- SECURITY DEFINER so it can remove the caller's auth.users row; FK cascades
-- then clean up the profile, memberships, and task assignments. Completions
-- are kept but anonymized (user_id -> null) so shared household history stays
-- intact. Solo households the user created (no other members) are removed too.

create or replace function public.delete_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  -- Remove households the user created that have no other members.
  delete from public.households h
  where h.created_by = uid
    and not exists (
      select 1 from public.household_members m
      where m.household_id = h.id and m.user_id <> uid
    );

  -- Deleting the auth user cascades to profiles, household_members and
  -- task_assignees; completions.user_id is set null.
  delete from auth.users where id = uid;
end;
$$;

grant execute on function public.delete_account() to authenticated;
