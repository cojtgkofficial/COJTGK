-- ============================================================
-- ChurchHQ Lyrics + Chords Library Migration
-- Chords remain in public.songs to preserve the service lineup.
-- FreeShow-ready plain lyrics use public.lyrics_library.
-- ============================================================

create table if not exists public.lyrics_library (
    id bigint primary key,
    title text not null,
    artist text not null default 'Unknown Artist',
    category text not null default 'Worship',
    lyrics text not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists lyrics_library_title_idx
    on public.lyrics_library (lower(title));

alter table public.lyrics_library enable row level security;

drop policy if exists "Lyrics permission select" on public.lyrics_library;
drop policy if exists "Lyrics permission insert" on public.lyrics_library;
drop policy if exists "Lyrics permission update" on public.lyrics_library;
drop policy if exists "Lyrics permission delete" on public.lyrics_library;

create policy "Lyrics permission select"
on public.lyrics_library
for select
to authenticated
using (public.has_page_permission('songs', 'view'));

create policy "Lyrics permission insert"
on public.lyrics_library
for insert
to authenticated
with check (public.has_page_permission('songs', 'add'));

create policy "Lyrics permission update"
on public.lyrics_library
for update
to authenticated
using (public.has_page_permission('songs', 'edit'))
with check (public.has_page_permission('songs', 'edit'));

create policy "Lyrics permission delete"
on public.lyrics_library
for delete
to authenticated
using (public.has_page_permission('songs', 'delete'));

grant select, insert, update, delete
on public.lyrics_library
to authenticated;

revoke all
on public.lyrics_library
from anon;

comment on table public.lyrics_library is
    'Plain song lyrics prepared for FreeShow; separate from chorded songs in public.songs.';

-- Keep the existing Chords Library table, but remove legacy policies whose
-- USING (true) condition could bypass the Song Library permission matrix.
alter table public.songs enable row level security;

drop policy if exists "Admins can delete songs" on public.songs;
drop policy if exists "Admins can insert songs" on public.songs;
drop policy if exists "Admins can update songs" on public.songs;
drop policy if exists "Authenticated users can read songs" on public.songs;
drop policy if exists "songs_permission_delete" on public.songs;
drop policy if exists "songs_permission_insert" on public.songs;
drop policy if exists "songs_permission_update" on public.songs;
drop policy if exists "songs_shared_view" on public.songs;
drop policy if exists "Chords permission select" on public.songs;
drop policy if exists "Chords permission insert" on public.songs;
drop policy if exists "Chords permission update" on public.songs;
drop policy if exists "Chords permission delete" on public.songs;

create policy "Chords permission select"
on public.songs
for select
to authenticated
using (public.has_page_permission('songs', 'view'));

create policy "Chords permission insert"
on public.songs
for insert
to authenticated
with check (public.has_page_permission('songs', 'add'));

create policy "Chords permission update"
on public.songs
for update
to authenticated
using (public.has_page_permission('songs', 'edit'))
with check (public.has_page_permission('songs', 'edit'));

create policy "Chords permission delete"
on public.songs
for delete
to authenticated
using (public.has_page_permission('songs', 'delete'));

grant select, insert, update, delete
on public.songs
to authenticated;
