create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'analyst', 'viewer');
  end if;
  if not exists (select 1 from pg_type where typname = 'merchant_status') then
    create type public.merchant_status as enum ('active', 'inactive');
  end if;
  if not exists (select 1 from pg_type where typname = 'risk_level') then
    create type public.risk_level as enum ('low', 'medium', 'high', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'transaction_status') then
    create type public.transaction_status as enum ('approved', 'declined', 'review');
  end if;
  if not exists (select 1 from pg_type where typname = 'rule_action') then
    create type public.rule_action as enum ('approve', 'decline', 'review', 'flag');
  end if;
  if not exists (select 1 from pg_type where typname = 'fraud_case_status') then
    create type public.fraud_case_status as enum ('open', 'investigating', 'confirmed_fraud', 'false_positive', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'fraud_case_priority') then
    create type public.fraud_case_priority as enum ('low', 'medium', 'high', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'alert_severity') then
    create type public.alert_severity as enum ('info', 'warning', 'critical');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_method_kind') then
    create type public.payment_method_kind as enum ('card', 'bank', 'wallet');
  end if;
  if not exists (select 1 from pg_type where typname = 'entity_list_kind') then
    create type public.entity_list_kind as enum ('whitelist', 'blacklist');
  end if;
  if not exists (select 1 from pg_type where typname = 'entity_type_kind') then
    create type public.entity_type_kind as enum ('ip', 'device', 'user', 'card_bin', 'email', 'email_domain');
  end if;
end $$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
as $$
  select coalesce((select role from public.users where id = auth.uid()), 'viewer'::public.app_role);
$$;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce((new.raw_user_meta_data ->> 'role')::public.app_role, 'viewer'::public.app_role)
  )
  on conflict (id) do update
    set full_name = excluded.full_name,
        role = excluded.role;
  return new;
end;
$$;

create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  role public.app_role not null default 'viewer',
  full_name text,
  organization_id uuid,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  api_key_hash text not null unique,
  webhook_url text,
  status public.merchant_status not null default 'active',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  fingerprint_hash text not null unique,
  browser text,
  os text,
  screen_resolution text,
  timezone text,
  language text,
  webgl_hash text,
  canvas_hash text,
  user_agent text,
  is_bot boolean not null default false,
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  first_seen_at timestamptz not null default timezone('utc', now()),
  last_seen_at timestamptz not null default timezone('utc', now()),
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  external_transaction_id text not null,
  amount numeric(12, 2) not null,
  currency char(3) not null default 'USD',
  payment_method_type public.payment_method_kind not null,
  card_bin text,
  card_last4 text,
  billing_country char(2),
  shipping_country char(2),
  ip_address inet not null,
  device_id uuid references public.devices(id) on delete set null,
  user_account_id text not null,
  risk_score integer not null default 0 check (risk_score between 0 and 100),
  risk_level public.risk_level not null default 'low',
  status public.transaction_status not null default 'approved',
  metadata jsonb not null default '{}'::jsonb,
  scored_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  unique (merchant_id, external_transaction_id)
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_account_id text not null,
  device_id uuid references public.devices(id) on delete set null,
  ip_address inet not null,
  geo_country char(2),
  geo_city text,
  geo_lat numeric(8, 5),
  geo_lon numeric(8, 5),
  started_at timestamptz not null default timezone('utc', now()),
  ended_at timestamptz
);

create table if not exists public.risk_scores (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references public.transactions(id) on delete cascade,
  overall_score integer not null check (overall_score between 0 and 100),
  velocity_score integer not null default 0 check (velocity_score between 0 and 100),
  device_score integer not null default 0 check (device_score between 0 and 100),
  geo_score integer not null default 0 check (geo_score between 0 and 100),
  behavioral_score integer not null default 0 check (behavioral_score between 0 and 100),
  rule_score integer not null default 0 check (rule_score between 0 and 100),
  ml_score integer not null default 0 check (ml_score between 0 and 100),
  explanation jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.risk_rules (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  condition jsonb not null,
  action public.rule_action not null default 'flag',
  score_impact integer not null default 0,
  is_active boolean not null default true,
  priority integer not null default 50,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.fraud_cases (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null unique references public.transactions(id) on delete cascade,
  status public.fraud_case_status not null default 'open',
  assigned_to uuid references public.users(id) on delete set null,
  priority public.fraud_case_priority not null default 'medium',
  notes jsonb not null default '[]'::jsonb,
  resolution text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.alerts (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  severity public.alert_severity not null default 'warning',
  title text not null,
  message text not null,
  transaction_id uuid references public.transactions(id) on delete cascade,
  is_read boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_account_id text not null,
  type public.payment_method_kind not null,
  provider text not null,
  last4 text,
  is_verified boolean not null default false,
  risk_level public.risk_level not null default 'low',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.whitelists_blacklists (
  id uuid primary key default gen_random_uuid(),
  entity_type public.entity_type_kind not null,
  entity_value text not null,
  list_type public.entity_list_kind not null,
  reason text,
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (entity_type, entity_value, list_type)
);

create index if not exists idx_transactions_merchant_created_at on public.transactions (merchant_id, created_at desc);
create index if not exists idx_transactions_ip_created_at on public.transactions (ip_address, created_at desc);
create index if not exists idx_transactions_device_created_at on public.transactions (device_id, created_at desc);
create index if not exists idx_devices_fingerprint_hash on public.devices (fingerprint_hash);
create index if not exists idx_fraud_cases_status_priority on public.fraud_cases (status, priority);
create index if not exists idx_transactions_user_created_at on public.transactions (user_account_id, created_at desc);
create index if not exists idx_alerts_is_read_created_at on public.alerts (is_read, created_at desc);

drop trigger if exists set_users_updated_at on public.users;
create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

drop trigger if exists set_risk_rules_updated_at on public.risk_rules;
create trigger set_risk_rules_updated_at
before update on public.risk_rules
for each row execute function public.set_updated_at();

drop trigger if exists set_fraud_cases_updated_at on public.fraud_cases;
create trigger set_fraud_cases_updated_at
before update on public.fraud_cases
for each row execute function public.set_updated_at();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

alter table public.users enable row level security;
alter table public.merchants enable row level security;
alter table public.devices enable row level security;
alter table public.transactions enable row level security;
alter table public.sessions enable row level security;
alter table public.risk_scores enable row level security;
alter table public.risk_rules enable row level security;
alter table public.fraud_cases enable row level security;
alter table public.alerts enable row level security;
alter table public.payment_methods enable row level security;
alter table public.whitelists_blacklists enable row level security;

drop policy if exists "users_self_select" on public.users;
create policy "users_self_select"
on public.users
for select
using (id = auth.uid() or public.current_app_role() in ('admin', 'analyst'));

drop policy if exists "users_self_update" on public.users;
create policy "users_self_update"
on public.users
for update
using (id = auth.uid() or public.current_app_role() = 'admin')
with check (id = auth.uid() or public.current_app_role() = 'admin');

drop policy if exists "merchants_admin_full" on public.merchants;
create policy "merchants_admin_full"
on public.merchants
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "merchants_read_team" on public.merchants;
create policy "merchants_read_team"
on public.merchants
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "devices_read_team" on public.devices;
create policy "devices_read_team"
on public.devices
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "devices_admin_write" on public.devices;
create policy "devices_admin_write"
on public.devices
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "transactions_read_team" on public.transactions;
create policy "transactions_read_team"
on public.transactions
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "transactions_admin_write" on public.transactions;
create policy "transactions_admin_write"
on public.transactions
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "transactions_merchant_select_own" on public.transactions;
create policy "transactions_merchant_select_own"
on public.transactions
for select
using ((auth.jwt() ->> 'merchant_id')::uuid = merchant_id);

drop policy if exists "transactions_merchant_insert_own" on public.transactions;
create policy "transactions_merchant_insert_own"
on public.transactions
for insert
with check ((auth.jwt() ->> 'merchant_id')::uuid = merchant_id);

drop policy if exists "sessions_read_team" on public.sessions;
create policy "sessions_read_team"
on public.sessions
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "sessions_admin_write" on public.sessions;
create policy "sessions_admin_write"
on public.sessions
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "risk_scores_read_team" on public.risk_scores;
create policy "risk_scores_read_team"
on public.risk_scores
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "risk_scores_admin_write" on public.risk_scores;
create policy "risk_scores_admin_write"
on public.risk_scores
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "risk_rules_read_team" on public.risk_rules;
create policy "risk_rules_read_team"
on public.risk_rules
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "risk_rules_admin_write" on public.risk_rules;
create policy "risk_rules_admin_write"
on public.risk_rules
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "fraud_cases_read_team" on public.fraud_cases;
create policy "fraud_cases_read_team"
on public.fraud_cases
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "fraud_cases_admin_write" on public.fraud_cases;
create policy "fraud_cases_admin_write"
on public.fraud_cases
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "fraud_cases_analyst_update_assigned" on public.fraud_cases;
create policy "fraud_cases_analyst_update_assigned"
on public.fraud_cases
for update
using (public.current_app_role() = 'analyst' and assigned_to = auth.uid())
with check (public.current_app_role() = 'analyst' and assigned_to = auth.uid());

drop policy if exists "alerts_read_team" on public.alerts;
create policy "alerts_read_team"
on public.alerts
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "alerts_admin_write" on public.alerts;
create policy "alerts_admin_write"
on public.alerts
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "payment_methods_read_team" on public.payment_methods;
create policy "payment_methods_read_team"
on public.payment_methods
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "payment_methods_admin_write" on public.payment_methods;
create policy "payment_methods_admin_write"
on public.payment_methods
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');

drop policy if exists "lists_read_team" on public.whitelists_blacklists;
create policy "lists_read_team"
on public.whitelists_blacklists
for select
using (public.current_app_role() in ('admin', 'analyst', 'viewer'));

drop policy if exists "lists_admin_write" on public.whitelists_blacklists;
create policy "lists_admin_write"
on public.whitelists_blacklists
for all
using (public.current_app_role() = 'admin')
with check (public.current_app_role() = 'admin');
