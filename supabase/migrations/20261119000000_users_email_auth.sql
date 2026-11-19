-- Profil publik pengguna. Verifikasi akun hanya lewat OTP email di Supabase Auth.
-- Aman dijalankan ulang; data lama tidak dihapus.

create table if not exists public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  email_verified boolean not null default false,
  phone text,
  name text
);

alter table public.users add column if not exists email text;
alter table public.users add column if not exists email_verified boolean;
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists name text;
alter table public.users drop column if exists phone_verified;

update public.users
set email = lower(btrim(email))
where email is not null
  and email <> lower(btrim(email));

insert into public.users (id, email, email_verified, phone, name)
select
  u.id,
  lower(btrim(u.email)),
  u.email_confirmed_at is not null,
  nullif(btrim(u.phone), ''),
  nullif(btrim(u.raw_user_meta_data ->> 'name'), '')
from auth.users u
where u.email is not null
  and btrim(u.email) <> ''
on conflict (id) do update
set email = excluded.email,
    email_verified = excluded.email_verified,
    phone = coalesce(public.users.phone, excluded.phone),
    name = coalesce(public.users.name, excluded.name);

do $$
declare
  missing_email_count bigint;
  duplicate_email text;
begin
  select count(*)
  into missing_email_count
  from public.users
  where email is null or btrim(email) = '';

  if missing_email_count > 0 then
    raise exception
      'Migrasi dihentikan: % baris public.users belum punya email.',
      missing_email_count;
  end if;

  select lower(email)
  into duplicate_email
  from public.users
  group by lower(email)
  having count(*) > 1
  limit 1;

  if duplicate_email is not null then
    raise exception
      'Migrasi dihentikan: email % duplikat di public.users.',
      duplicate_email;
  end if;
end
$$;

alter table public.users alter column email set not null;
alter table public.users alter column email_verified set default false;
update public.users set email_verified = false where email_verified is null;
alter table public.users alter column email_verified set not null;

create unique index if not exists users_email_lower_key
  on public.users (lower(email));

create or replace function public.handle_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is null or btrim(new.email) = '' then
    return new;
  end if;

  insert into public.users (id, email, email_verified, phone, name)
  values (
    new.id,
    lower(btrim(new.email)),
    new.email_confirmed_at is not null,
    nullif(btrim(new.phone), ''),
    nullif(btrim(new.raw_user_meta_data ->> 'name'), '')
  )
  on conflict (id) do update
  set email = excluded.email,
      email_verified = excluded.email_verified;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_auth_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, email_confirmed_at on auth.users
  for each row execute function public.handle_auth_user();

alter table public.users enable row level security;

do $$
declare
  policy_row record;
begin
  for policy_row in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'users'
  loop
    execute format('drop policy %I on public.users', policy_row.policyname);
  end loop;
end
$$;

create policy "users_select_own"
  on public.users
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "users_update_own"
  on public.users
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

revoke all on table public.users from anon;
revoke all on table public.users from authenticated;
grant select on table public.users to authenticated;
grant update (phone, name) on table public.users to authenticated;
