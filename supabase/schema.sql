-- ============================================================================
-- SKEMA DATABASE UNTUK LOGIN APP
-- Jalankan script ini di Supabase Dashboard > SQL Editor
-- ============================================================================

-- 1. Buat tabel profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique not null,
  nama text not null,
  email text not null,
  created_at timestamp with time zone default now()
);

-- 2. Aktifkan Row Level Security (WAJIB)
alter table public.profiles enable row level security;

-- 3. Policy: siapa saja (termasuk yang belum login) boleh membaca profiles.
--    Ini diperlukan agar proses "login dengan username" bisa mencari email
--    berdasarkan username sebelum user tersebut login.
create policy "Profiles dapat dibaca publik"
  on public.profiles for select
  using (true);

-- 4. Policy: user hanya boleh membuat baris profile miliknya sendiri
--    (id harus sama dengan auth.uid() milik user yang baru mendaftar).
create policy "User dapat membuat profile miliknya sendiri"
  on public.profiles for insert
  with check (auth.uid() = id);

-- 5. Policy: user hanya boleh mengubah profile miliknya sendiri
create policy "User dapat mengubah profile miliknya sendiri"
  on public.profiles for update
  using (auth.uid() = id);
