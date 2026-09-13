-- Meta Ads sync tables for A.V.A. Command Center
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS meta_campaigns (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_id text UNIQUE NOT NULL,
  brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'PAUSED',
  effective_status text,
  objective text,
  daily_budget numeric,
  lifetime_budget numeric,
  spend numeric DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  ctr numeric,
  cpc numeric,
  conversions integer DEFAULT 0,
  cost_per_conversion numeric,
  start_time timestamptz,
  end_time timestamptz,
  last_synced_at timestamptz DEFAULT now(),
  ai_health integer DEFAULT 50,
  ai_recommendation text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta_adsets (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_id text UNIQUE NOT NULL,
  campaign_meta_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'PAUSED',
  effective_status text,
  daily_budget numeric,
  optimization_goal text,
  billing_event text,
  age_min integer,
  age_max integer,
  locations text,
  platforms text,
  spend numeric DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  start_time timestamptz,
  end_time timestamptz,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS meta_ads_detail (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  meta_id text UNIQUE NOT NULL,
  adset_meta_id text NOT NULL,
  campaign_meta_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'PAUSED',
  effective_status text,
  creative_id text,
  spend numeric DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  conversions integer DEFAULT 0,
  last_synced_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_worker_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_name text NOT NULL,
  action text NOT NULL,
  target text,
  details text,
  severity text DEFAULT 'info',
  created_at timestamptz DEFAULT now()
);

-- RLS policies
ALTER TABLE meta_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE meta_ads_detail ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_worker_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_meta_campaigns" ON meta_campaigns FOR SELECT USING (true);
CREATE POLICY "anon_write_meta_campaigns" ON meta_campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_meta_campaigns" ON meta_campaigns FOR UPDATE USING (true);

CREATE POLICY "anon_read_meta_adsets" ON meta_adsets FOR SELECT USING (true);
CREATE POLICY "anon_write_meta_adsets" ON meta_adsets FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_meta_adsets" ON meta_adsets FOR UPDATE USING (true);

CREATE POLICY "anon_read_meta_ads_detail" ON meta_ads_detail FOR SELECT USING (true);
CREATE POLICY "anon_write_meta_ads_detail" ON meta_ads_detail FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_update_meta_ads_detail" ON meta_ads_detail FOR UPDATE USING (true);

CREATE POLICY "anon_read_ai_worker_log" ON ai_worker_log FOR SELECT USING (true);
CREATE POLICY "anon_write_ai_worker_log" ON ai_worker_log FOR INSERT WITH CHECK (true);

-- Seed with REAL data from Meta Ads API (account 201594077 - Serin Tagaytay Staycation)
-- Active campaigns
INSERT INTO meta_campaigns (meta_id, name, status, effective_status, objective, daily_budget, spend, impressions, clicks, ctr, cpc, conversions, start_time, ai_health, ai_recommendation) VALUES
('52606759026755', 'New Sales Campaign', 'ACTIVE', 'ACTIVE', 'OUTCOME_SALES', 100, 0.51, 14, 2, 14.29, 0.26, 0, '2026-09-11T21:54:18-07:00', 35, 'Low impressions after 2 days. Budget too low for Sales objective. Recommend increasing to PHP300/day or switching to Messages objective for better reach.'),
('52606760047155', 'New Sales Campaign - Copy', 'ACTIVE', 'ACTIVE', 'OUTCOME_SALES', 100, 1.53, 14, 2, 14.29, 0.77, 0, '2026-09-11T21:55:27-07:00', 15, 'DUPLICATE campaign competing with original. Pause immediately — splits budget and raises auction costs.'),
('6864906373151', 'Post: Rainy Weather, Cozy Together', 'ACTIVE', 'CAMPAIGN_PAUSED', 'MESSAGES', 60, 0, 0, 0, null, null, 0, '2025-07-26T17:23:44-07:00', 0, 'Expired boosted post (ended Aug 2025). Still marked Active. Clean up — pause to declutter.'),
('6812939763551', 'Post: Premium 2BR w/taal view & Parking', 'ACTIVE', 'CAMPAIGN_PAUSED', 'MESSAGES', 100, 0, 0, 0, null, null, 0, '2025-05-26T15:45:59-07:00', 0, 'Expired boosted post (ended May 2025). Pause to keep account clean.'),
('6648256914551', 'Post: Serin West and Serin East Tagaytay', 'ACTIVE', 'CAMPAIGN_PAUSED', 'MESSAGES', null, 0, 0, 0, null, null, 0, '2024-11-01T19:52:39-07:00', 0, 'Expired boosted post. Lifetime budget exhausted. Pause.'),
('6601773392551', 'Post: Discover affordable relaxation this summer', 'ACTIVE', 'CAMPAIGN_PAUSED', 'MESSAGES', null, 0, 0, 0, null, null, 0, '2024-04-23T01:04:27-07:00', 0, 'Expired boosted post from Apr 2024. Pause.'),
('6601772861751', 'Post: Discover affordable relaxation (duplicate)', 'ACTIVE', 'CAMPAIGN_PAUSED', 'MESSAGES', null, 0, 0, 0, null, null, 0, '2024-04-23T01:02:05-07:00', 0, 'Duplicate expired post. Pause.'),
('6587543353951', 'Post: Firing Sports attire ang atake', 'ACTIVE', 'CAMPAIGN_PAUSED', 'LINK_CLICKS', null, 0, 0, 0, null, null, 0, '2024-03-01T16:13:05-08:00', 0, 'Expired boosted post from Mar 2024. Pause.'),
('6502470481151', 'Post: Available Units Serin West Tagaytay', 'ACTIVE', 'CAMPAIGN_PAUSED', 'MESSAGES', null, 0, 0, 0, null, null, 0, '2023-10-27T01:57:58-07:00', 0, 'Expired since Nov 2023. Pause.'),
('6476360987751', 'Post: Arriving late? No worries', 'ACTIVE', 'CAMPAIGN_PAUSED', 'POST_ENGAGEMENT', null, 0, 0, 0, null, null, 0, '2023-09-30T03:44:42-07:00', 0, 'Expired since Oct 2023. Pause.'),
('6426592083551', 'Post: Available Units today and onwards', 'ACTIVE', 'CAMPAIGN_PAUSED', 'POST_ENGAGEMENT', null, 0, 0, 0, null, null, 0, '2023-09-08T21:01:27-07:00', 0, 'Expired since Sep 2023. Pause.'),
('6350693882951', 'Post: Available today!', 'ACTIVE', 'CAMPAIGN_PAUSED', 'MESSAGES', null, 0, 0, 0, null, null, 0, '2023-05-12T19:30:44-07:00', 0, 'Expired since May 2023. Pause.'),
('6262259342551', 'Post: 3 days to go!', 'ACTIVE', 'CAMPAIGN_PAUSED', 'MESSAGES', null, 0, 0, 0, null, null, 0, '2021-05-18T21:34:58-07:00', 0, 'Expired since May 2021. Pause immediately.'),
('6648026168551', 'Post: Introducing some of the units', 'PAUSED', 'PAUSED', 'LINK_CLICKS', null, 0, 0, 0, null, null, 0, '2024-11-01T00:29:56-07:00', 10, 'Already paused. Expired.'),
('6502470460551', 'Post: Available Units Serin West (paused)', 'PAUSED', 'PAUSED', 'MESSAGES', null, 0, 0, 0, null, null, 0, '2023-10-27T01:57:04-07:00', 10, 'Already paused. Expired.'),
('6261975876151', 'Lead Gen: Serin East Tagaytay', 'PAUSED', 'PAUSED', 'LEAD_GENERATION', 250, 0, 0, 0, null, null, 0, '2021-05-16T16:01:21-07:00', 10, 'Already paused. Old lead gen campaign.')
ON CONFLICT (meta_id) DO UPDATE SET
  spend = EXCLUDED.spend, impressions = EXCLUDED.impressions, clicks = EXCLUDED.clicks,
  ctr = EXCLUDED.ctr, cpc = EXCLUDED.cpc, ai_health = EXCLUDED.ai_health,
  ai_recommendation = EXCLUDED.ai_recommendation, last_synced_at = now();

-- Ad Sets for active campaigns
INSERT INTO meta_adsets (meta_id, campaign_meta_id, name, status, effective_status, optimization_goal, billing_event, age_min, age_max, locations, platforms, spend, impressions, clicks, start_time) VALUES
('52606759031355', '52606759026755', 'New Sales Ad Set', 'ACTIVE', 'ACTIVE', 'CONVERSATIONS', 'IMPRESSIONS', 24, 50, 'Metro Manila, Calabarzon', 'Facebook, Messenger', 0.51, 14, 2, '2026-09-11T21:54:18-07:00'),
('52606760047355', '52606760047155', 'New Sales Ad Set - Copy', 'ACTIVE', 'ACTIVE', 'CONVERSATIONS', 'IMPRESSIONS', 24, 50, 'Metro Manila, Calabarzon', 'Facebook, Messenger', 1.53, 14, 2, '2026-09-11T21:55:27-07:00')
ON CONFLICT (meta_id) DO UPDATE SET
  spend = EXCLUDED.spend, impressions = EXCLUDED.impressions, clicks = EXCLUDED.clicks, last_synced_at = now();

-- Ads for active campaigns
INSERT INTO meta_ads_detail (meta_id, adset_meta_id, campaign_meta_id, name, status, effective_status, creative_id, spend, impressions, clicks) VALUES
('52606759064155', '52606759031355', '52606759026755', 'weekender', 'ACTIVE', 'ACTIVE', '2612684319169178', 0.51, 14, 2),
('52606760047555', '52606760047355', '52606760047155', 'weekender - Copy', 'ACTIVE', 'ACTIVE', '2147465986128774', 1.53, 14, 2)
ON CONFLICT (meta_id) DO UPDATE SET
  spend = EXCLUDED.spend, impressions = EXCLUDED.impressions, clicks = EXCLUDED.clicks, last_synced_at = now();

-- AI Worker activity log seed
INSERT INTO ai_worker_log (worker_name, action, target, details, severity) VALUES
('Ad Analyst', 'ALERT', 'New Sales Campaign - Copy', 'Duplicate campaign detected. Competing against original in same auction. Recommend pausing immediately.', 'critical'),
('Ad Analyst', 'ALERT', 'Account Cleanup', '11 expired boosted posts still marked Active. Cluttering account and confusing reporting.', 'warning'),
('Ad Analyst', 'MONITOR', 'New Sales Campaign', 'Campaign just started (2 days). PHP0.51 spent, 14 impressions. Too early for definitive judgment but impressions are low for Sales objective.', 'info'),
('Ad Analyst', 'SUGGEST', 'Budget Strategy', 'Current PHP200/day total across 2 campaigns. Consolidate into 1 campaign at PHP200/day for better optimization. Meta needs ~50 conversions/week for proper learning.', 'warning'),
('Ad Analyst', 'SUGGEST', 'Objective Change', 'OUTCOME_SALES requires purchase tracking pixel. If goal is Messenger inquiries, switch to OUTCOME_ENGAGEMENT with Messages optimization for lower cost per conversation.', 'info');
