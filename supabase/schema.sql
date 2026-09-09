create table public.beta_signups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  automation_level text not null,
  created_at timestamptz not null default now()
);

alter table public.beta_signups enable row level security;

-- The browser may insert a beta lead, but cannot read any stored lead.
create policy "Anyone can join the beta"
  on public.beta_signups
  for insert
  to anon
  with check (
    char_length(trim(name)) > 0
    and email ~* '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
    and automation_level in ('recommendation', 'preparation', 'automatic')
  );
