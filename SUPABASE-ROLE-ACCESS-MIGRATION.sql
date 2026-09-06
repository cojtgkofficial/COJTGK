-- ============================================================
-- COJTGK ChurchHQ: Administrator/User page-access migration
-- Safe migration: adds columns and policies; does not delete data.
-- Run once in Supabase Dashboard > SQL Editor.
-- ============================================================

begin;

alter table public.user_roles
    add column if not exists member_type text,
    add column if not exists permissions jsonb,
    add column if not exists email text,
    add column if not exists display_name text,
    add column if not exists updated_at timestamptz default now();

alter table public.user_roles
    drop constraint if exists user_roles_member_type_check;

alter table public.user_roles
    add constraint user_roles_member_type_check
    check (member_type in ('administrator', 'user'));

-- Existing admin accounts remain Administrators. All others become Users.
update public.user_roles
set member_type = case
    when lower(coalesce(role, '')) = 'admin' then 'administrator'
    else 'user'
end
where member_type is null;

update public.user_roles ur
set email = au.email
from auth.users au
where ur.user_id = au.id
  and ur.email is null;

-- User defaults: every page is visible; Add/Edit/Delete are disabled.
update public.user_roles
set permissions = jsonb_build_object(
    'dashboard',       jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'service-planner', jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'program-planner', jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'bible',           jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'songs',           jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'editor',          jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'members',         jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'leaders',         jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'attendance',      jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'reports',         jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'files',           jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
    'settings',        jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false)
)
where permissions is null;

alter table public.user_roles
    alter column member_type set default 'user',
    alter column member_type set not null;

create unique index if not exists user_roles_user_id_unique
    on public.user_roles(user_id);

create or replace function public.is_access_administrator(check_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.user_roles
        where user_id = check_user
          and (member_type = 'administrator' or lower(coalesce(role, '')) = 'admin')
    );
$$;

create or replace function public.has_page_permission(page_key text, action_key text, check_user uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select public.is_access_administrator(check_user)
        or coalesce((
            select (permissions -> page_key ->> action_key)::boolean
            from public.user_roles
            where user_id = check_user
        ), false);
$$;

revoke all on function public.is_access_administrator(uuid) from public;
revoke all on function public.has_page_permission(text, text, uuid) from public;
grant execute on function public.is_access_administrator(uuid) to authenticated;
grant execute on function public.has_page_permission(text, text, uuid) to authenticated;

-- Automatically create a View-only role record for every new Auth user.
create or replace function public.create_default_user_access()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.user_roles (user_id, role, member_type, email, display_name, permissions)
    values (
        new.id,
        'viewer',
        'user',
        new.email,
        coalesce(new.raw_user_meta_data ->> 'full_name', split_part(coalesce(new.email, ''), '@', 1)),
        jsonb_build_object(
            'dashboard',       jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'service-planner', jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'program-planner', jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'bible',           jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'songs',           jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'editor',          jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'members',         jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'leaders',         jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'attendance',      jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'reports',         jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'files',           jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false),
            'settings',        jsonb_build_object('view', true, 'add', false, 'edit', false, 'delete', false)
        )
    )
    on conflict (user_id) do nothing;
    return new;
end;
$$;

drop trigger if exists create_default_user_access_trigger on auth.users;
create trigger create_default_user_access_trigger
after insert on auth.users
for each row execute function public.create_default_user_access();

-- Role table: users see their own access; Administrators manage all access.
alter table public.user_roles enable row level security;
drop policy if exists "user_roles_select_own_or_admin" on public.user_roles;
drop policy if exists "user_roles_admin_update" on public.user_roles;
drop policy if exists "user_roles_admin_insert" on public.user_roles;

create policy "user_roles_select_own_or_admin"
on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.is_access_administrator());

create policy "user_roles_admin_update"
on public.user_roles for update to authenticated
using (public.is_access_administrator())
with check (public.is_access_administrator());

create policy "user_roles_admin_insert"
on public.user_roles for insert to authenticated
with check (public.is_access_administrator());

-- Shared Song Library: all signed-in users may view the same songs.
-- Add/Edit/Delete are controlled by the Song Library permission matrix.
alter table public.songs enable row level security;
drop policy if exists "songs_shared_view" on public.songs;
drop policy if exists "songs_permission_insert" on public.songs;
drop policy if exists "songs_permission_update" on public.songs;
drop policy if exists "songs_permission_delete" on public.songs;

create policy "songs_shared_view"
on public.songs for select to authenticated
using (public.has_page_permission('songs', 'view'));

create policy "songs_permission_insert"
on public.songs for insert to authenticated
with check (public.has_page_permission('songs', 'add'));

create policy "songs_permission_update"
on public.songs for update to authenticated
using (public.has_page_permission('songs', 'edit'))
with check (public.has_page_permission('songs', 'edit'));

create policy "songs_permission_delete"
on public.songs for delete to authenticated
using (public.has_page_permission('songs', 'delete'));

commit;
