-- Movie Management System: Supabase PostgreSQL schema
create extension if not exists pgcrypto;

create table if not exists public.movies (
  id uuid primary key default gen_random_uuid(),
  title varchar(150) not null check (char_length(trim(title)) > 0),
  director varchar(120),
  release_year integer check (release_year is null or release_year between 1888 and 2100),
  genre varchar(40) not null check (genre in (
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Fantasy', 'Horror', 'Romance', 'Science Fiction', 'Thriller', 'Other'
  )),
  rating numeric(3,1) check (rating is null or rating between 0 and 10),
  poster_url text check (poster_url is null or char_length(poster_url) <= 1000),
  notes varchar(1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists movies_title_idx on public.movies (lower(title));
create index if not exists movies_genre_idx on public.movies (genre);
create index if not exists movies_created_at_idx on public.movies (created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists movies_set_updated_at on public.movies;
create trigger movies_set_updated_at
before update on public.movies
for each row execute function public.set_updated_at();

-- This app accesses PostgreSQL only through its Express server using a
-- server-side service-role key. Keep that key private and never expose it
-- in frontend files. Do not enable public table access for this demo.
alter table public.movies enable row level security;
-- No public policies are created intentionally.
