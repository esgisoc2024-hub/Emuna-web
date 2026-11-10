-- Roles y permisos de usuarios (correr después de schema.sql).
-- Roles: admin (acceso total al panel), editor y lector (por ahora no pueden ingresar).

create table if not exists public.user_roles(
  user_id uuid primary key references auth.users on delete cascade,
  email text,
  role text not null default 'lector' check (role in ('admin','editor','lector')),
  created_at timestamptz default now()
);
alter table public.user_roles enable row level security;

create or replace function public.my_role() returns text
language sql stable security definer set search_path = '' as $$
  select role from public.user_roles where user_id = auth.uid()
$$;

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists(select 1 from public.user_roles where user_id = auth.uid() and role = 'admin')
$$;

-- Todo usuario nuevo arranca como "lector" (sin acceso al panel).
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.user_roles(user_id, email, role) values (new.id, new.email, 'lector')
  on conflict (user_id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Usuarios ya existentes: el email de EMUNÁ queda como admin, el resto como lector.
insert into public.user_roles(user_id, email, role)
select id, email, case when email = 'agency.emuna@gmail.com' then 'admin' else 'lector' end from auth.users
on conflict (user_id) do nothing;

-- Cada usuario ve su propio rol; los admins ven todos. Los cambios se hacen desde el servidor.
drop policy if exists "own role" on public.user_roles;
create policy "own role" on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- Datos del panel: solo administradores.
drop policy if exists "admin clients" on public.clients;
drop policy if exists "admin proposals" on public.proposals;
drop policy if exists "admin cases" on public.cases;
create policy "admin clients" on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin proposals" on public.proposals for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin cases" on public.cases for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin uploads" on storage.objects;
create policy "admin uploads" on storage.objects for all to authenticated
  using (bucket_id = 'cases' and public.is_admin()) with check (bucket_id = 'cases' and public.is_admin());

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.my_role() from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.my_role() to authenticated;
