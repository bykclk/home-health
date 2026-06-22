-- Fix: create_household used gen_random_bytes (pgcrypto), which on Supabase
-- lives in the `extensions` schema and is therefore not on the function's
-- `search_path = public`, raising "function gen_random_bytes(integer) does not
-- exist". Generate the invite code with the always-available random() instead,
-- using an unambiguous alphabet (no 0/O/1/I).

create or replace function public.create_household(p_name text)
returns public.households
language plpgsql
security definer
set search_path = public
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code  text;
  v_house public.households;
  i int;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  loop
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_alphabet, floor(random() * length(v_alphabet))::int + 1, 1);
    end loop;
    exit when not exists (select 1 from public.households where invite_code = v_code);
  end loop;

  insert into public.households (name, invite_code, created_by)
  values (coalesce(nullif(trim(p_name), ''), 'Home'), v_code, auth.uid())
  returning * into v_house;

  insert into public.household_members (household_id, user_id, role)
  values (v_house.id, auth.uid(), 'owner');

  return v_house;
end;
$$;
