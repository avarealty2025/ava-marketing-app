-- A.V.A. Realty Marketing Engine — Supabase Schema
-- Run this in the Supabase SQL Editor after creating your project

-- Brands
create table brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  phase int not null default 0,
  status text not null default 'placeholder' check (status in ('active', 'placeholder', 'paused')),
  monthly_budget_ceiling numeric,
  daily_budget_ceiling numeric,
  autonomy_level text not null default 'LOW' check (autonomy_level in ('LOW', 'MEDIUM', 'HIGH')),
  created_at timestamptz not null default now()
);

-- Approval Queue
create table approvals (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  title text not null,
  description text,
  category text not null check (category in ('campaign', 'creative', 'budget', 'content', 'audience')),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'critical')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'expired')),
  submitted_by text not null default 'AI Marketing Director',
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Campaigns
create table campaigns (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  meta_campaign_id text,
  name text not null,
  objective text not null,
  status text not null default 'draft' check (status in ('paused', 'active', 'completed', 'draft')),
  daily_budget numeric,
  total_spend numeric not null default 0,
  messages int not null default 0,
  cost_per_message numeric,
  impressions int not null default 0,
  ctr numeric,
  last_synced_at timestamptz,
  created_at timestamptz not null default now()
);

-- Content Calendar
create table content_calendar (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  title text not null,
  pillar text not null,
  platform text not null default 'both' check (platform in ('facebook', 'instagram', 'both')),
  format text not null default 'image' check (format in ('image', 'video', 'carousel', 'reel', 'story')),
  status text not null default 'idea' check (status in ('idea', 'drafted', 'approved', 'scheduled', 'published')),
  scheduled_date date,
  copy text,
  created_at timestamptz not null default now()
);

-- Daily Pulse (performance snapshots)
create table daily_pulse (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  brand_id uuid references brands(id) on delete cascade,
  spend numeric not null default 0,
  messages int not null default 0,
  cost_per_message numeric,
  impressions int not null default 0,
  ctr numeric,
  anomalies text[],
  created_at timestamptz not null default now(),
  unique (date, brand_id)
);

-- Activity Log
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references brands(id) on delete cascade,
  actor text not null,
  action text not null,
  details text,
  created_at timestamptz not null default now()
);

-- Enable Row Level Security
alter table brands enable row level security;
alter table approvals enable row level security;
alter table campaigns enable row level security;
alter table content_calendar enable row level security;
alter table daily_pulse enable row level security;
alter table activity_log enable row level security;

-- Public read policies (for the dashboard — tighten these later with auth)
create policy "Public read brands" on brands for select using (true);
create policy "Public read approvals" on approvals for select using (true);
create policy "Public read campaigns" on campaigns for select using (true);
create policy "Public read content" on content_calendar for select using (true);
create policy "Public read pulse" on daily_pulse for select using (true);
create policy "Public read activity" on activity_log for select using (true);

-- Public write policies (for AI workers to write data — tighten with service role later)
create policy "Public insert approvals" on approvals for insert with check (true);
create policy "Public update approvals" on approvals for update using (true);
create policy "Public insert campaigns" on campaigns for insert with check (true);
create policy "Public update campaigns" on campaigns for update using (true);
create policy "Public insert content" on content_calendar for insert with check (true);
create policy "Public update content" on content_calendar for update using (true);
create policy "Public insert pulse" on daily_pulse for insert with check (true);
create policy "Public insert activity" on activity_log for insert with check (true);

-- Seed data: the three brands
insert into brands (name, slug, phase, status, autonomy_level) values
  ('Serin Tagaytay Staycation', 'serin', 0, 'active', 'LOW'),
  ('SmartLock Solutions', 'smartlock', 2, 'placeholder', 'LOW'),
  ('One Tolentino East Residences', 'one-tolentino', 2, 'placeholder', 'LOW');

-- Seed: the campaign we just created
insert into campaigns (brand_id, meta_campaign_id, name, objective, status, daily_budget) values
  ((select id from brands where slug = 'serin'), '23859911047740799', 'SERIN | MESSAGES | Weekend Booker', 'OUTCOME_ENGAGEMENT', 'paused', 300);

-- Seed: sample approval items
insert into approvals (brand_id, title, description, category, priority, submitted_by) values
  ((select id from brands where slug = 'serin'), 'Activate Weekend Booker Campaign', 'Campaign structure is ready with 2 ad slots. Need ad creatives attached, then activate. Daily budget: ₱300.', 'campaign', 'high', 'Ads Manager'),
  ((select id from brands where slug = 'serin'), 'Set Monthly Budget Ceiling', 'Required before any campaign goes live. Suggested: ₱9,000-15,000/month based on historical performance.', 'budget', 'critical', 'Marketing Director'),
  ((select id from brands where slug = 'serin'), 'Accept LeadGen Terms of Service', 'All 3 pages need LeadGen ToS accepted at facebook.com/legal/leadgen/tos before lead form ads can run.', 'campaign', 'high', 'Ads Manager');
