-- Ejecutar en Supabase > SQL Editor
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  company text,
  service text not null,
  message text not null,
  status text not null default 'nuevo'  -- nuevo | contactado | propuesta | ganado | perdido
);

-- Seguridad: nadie accede desde el navegador. Solo el servidor (clave service_role).
alter table public.leads enable row level security;
