create table clients(id uuid primary key default gen_random_uuid(), name text not null, email text, phone text, company text, service text,
  status text default 'nuevo', notes text, source text default 'manual', created_at timestamptz default now());
create table proposals(id uuid primary key default gen_random_uuid(), client_id uuid references clients on delete cascade,
  subject text, body text, amount text, sent_at timestamptz default now());
create table cases(id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null, client text, service text,
  summary text, results text, site_url text, video_url text, images text[] default '{}', published boolean default false, created_at timestamptz default now());
alter table clients enable row level security; alter table proposals enable row level security; alter table cases enable row level security;
create policy "admin clients" on clients for all to authenticated using (true) with check (true);
create policy "admin proposals" on proposals for all to authenticated using (true) with check (true);
create policy "admin cases" on cases for all to authenticated using (true) with check (true);
create policy "public cases" on cases for select to anon using (published);
insert into storage.buckets (id,name,public) values ('cases','cases',true);
create policy "admin uploads" on storage.objects for all to authenticated using (bucket_id='cases') with check (bucket_id='cases');
