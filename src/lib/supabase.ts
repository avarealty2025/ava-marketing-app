import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Brand = {
  id: string;
  name: string;
  slug: string;
  phase: number;
  status: "active" | "placeholder" | "paused";
  monthly_budget_ceiling: number | null;
  daily_budget_ceiling: number | null;
  autonomy_level: "LOW" | "MEDIUM" | "HIGH";
  created_at: string;
};

export type Approval = {
  id: string;
  brand_id: string;
  title: string;
  description: string;
  category: "campaign" | "creative" | "budget" | "content" | "audience";
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "approved" | "rejected" | "expired";
  created_at: string;
  updated_at: string;
  submitted_by: string;
  metadata: Record<string, unknown> | null;
};

export type Campaign = {
  id: string;
  brand_id: string;
  meta_campaign_id: string | null;
  name: string;
  objective: string;
  status: "paused" | "active" | "completed" | "draft";
  daily_budget: number | null;
  total_spend: number;
  messages: number;
  cost_per_message: number | null;
  impressions: number;
  ctr: number | null;
  last_synced_at: string | null;
  created_at: string;
};

export type ContentItem = {
  id: string;
  brand_id: string;
  title: string;
  pillar: string;
  platform: "facebook" | "instagram" | "both";
  format: "image" | "video" | "carousel" | "reel" | "story";
  status: "idea" | "drafted" | "approved" | "scheduled" | "published";
  scheduled_date: string | null;
  copy: string | null;
  created_at: string;
};

export type DailyPulse = {
  id: string;
  date: string;
  brand_id: string;
  spend: number;
  messages: number;
  cost_per_message: number | null;
  impressions: number;
  ctr: number | null;
  anomalies: string[] | null;
  created_at: string;
};

export type MetaCampaign = {
  id: string;
  meta_id: string;
  brand_id: string | null;
  name: string;
  status: string;
  effective_status: string | null;
  objective: string | null;
  daily_budget: number | null;
  lifetime_budget: number | null;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number | null;
  cpc: number | null;
  conversions: number;
  cost_per_conversion: number | null;
  start_time: string | null;
  end_time: string | null;
  last_synced_at: string | null;
  ai_health: number;
  ai_recommendation: string | null;
  created_at: string;
};

export type MetaAdSet = {
  id: string;
  meta_id: string;
  campaign_meta_id: string;
  name: string;
  status: string;
  effective_status: string | null;
  daily_budget: number | null;
  optimization_goal: string | null;
  billing_event: string | null;
  age_min: number | null;
  age_max: number | null;
  locations: string | null;
  platforms: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  start_time: string | null;
  end_time: string | null;
  last_synced_at: string | null;
  created_at: string;
};

export type MetaAd = {
  id: string;
  meta_id: string;
  adset_meta_id: string;
  campaign_meta_id: string;
  name: string;
  status: string;
  effective_status: string | null;
  creative_id: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  last_synced_at: string | null;
  created_at: string;
};

export type AIWorkerLog = {
  id: string;
  worker_name: string;
  action: string;
  target: string | null;
  details: string | null;
  severity: string;
  created_at: string;
};
