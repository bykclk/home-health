-- Base table/function privileges for the PostgREST `authenticated` role.
-- RLS still restricts WHICH rows each user may see/modify; these grants are the
-- prerequisite base privilege (without them, direct table access from the app
-- fails with "permission denied for table ..."). SECURITY DEFINER RPCs such as
-- create_household worked without this, which is why creating a household
-- succeeded but adding a room (a direct insert) did not.

grant usage on schema public to authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on all functions in schema public to authenticated;

-- Apply the same defaults to anything added later in this schema.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant usage, select on sequences to authenticated;
alter default privileges in schema public
  grant execute on functions to authenticated;
