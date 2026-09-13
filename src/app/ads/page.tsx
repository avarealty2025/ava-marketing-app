"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { MetaCampaign, MetaAdSet, MetaAd, AIWorkerLog } from "@/lib/supabase";

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20",
    PAUSED: "bg-amber-500/15 text-amber-400 border-amber-500/20",
    CAMPAIGN_PAUSED: "bg-red-500/15 text-red-400 border-red-500/20",
    DELETED: "bg-zinc-700/50 text-zinc-500 border-zinc-600/20",
  };
  const label: Record<string, string> = {
    ACTIVE: "Live",
    PAUSED: "Paused",
    CAMPAIGN_PAUSED: "Expired",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${colors[status] || colors.PAUSED}`}>
      {label[status] || status}
    </span>
  );
}

function HealthBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-400" : score >= 40 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="flex items-center gap-2">
      <div className="w-16 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${score}%` }} />
      </div>
      <span className={`text-[11px] font-mono font-bold ${score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-red-400"}`}>
        {score}
      </span>
    </div>
  );
}

function SeverityIcon({ severity }: { severity: string }) {
  if (severity === "critical") return <span className="flex w-2 h-2 rounded-full bg-red-400 animate-pulse" />;
  if (severity === "warning") return <span className="flex w-2 h-2 rounded-full bg-amber-400" />;
  if (severity === "success") return <span className="flex w-2 h-2 rounded-full bg-emerald-400" />;
  return <span className="flex w-2 h-2 rounded-full bg-blue-400" />;
}

function ObjectiveBadge({ objective }: { objective: string | null }) {
  if (!objective) return <span className="text-zinc-600">—</span>;
  const map: Record<string, { label: string; color: string }> = {
    OUTCOME_SALES: { label: "Sales", color: "text-purple-400 bg-purple-500/10" },
    OUTCOME_LEADS: { label: "Leads", color: "text-blue-400 bg-blue-500/10" },
    OUTCOME_TRAFFIC: { label: "Traffic", color: "text-cyan-400 bg-cyan-500/10" },
    OUTCOME_ENGAGEMENT: { label: "Engagement", color: "text-pink-400 bg-pink-500/10" },
    MESSAGES: { label: "Messages", color: "text-emerald-400 bg-emerald-500/10" },
    LINK_CLICKS: { label: "Link Clicks", color: "text-cyan-400 bg-cyan-500/10" },
    POST_ENGAGEMENT: { label: "Post Boost", color: "text-pink-400 bg-pink-500/10" },
    LEAD_GENERATION: { label: "Lead Gen", color: "text-blue-400 bg-blue-500/10" },
  };
  const m = map[objective] || { label: objective, color: "text-zinc-400 bg-zinc-500/10" };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${m.color}`}>
      {m.label}
    </span>
  );
}

export default function AdsCommandCenter() {
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [adsets, setAdsets] = useState<MetaAdSet[]>([]);
  const [ads, setAds] = useState<MetaAd[]>([]);
  const [logs, setLogs] = useState<AIWorkerLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<"all" | "active" | "expired" | "paused">("all");

  useEffect(() => {
    async function load() {
      const [cRes, asRes, adRes, logRes] = await Promise.all([
        supabase.from("meta_campaigns").select("*").order("ai_health", { ascending: true }),
        supabase.from("meta_adsets").select("*"),
        supabase.from("meta_ads_detail").select("*"),
        supabase.from("ai_worker_log").select("*").order("created_at", { ascending: false }).limit(20),
      ]);
      setCampaigns(cRes.data ?? []);
      setAdsets(asRes.data ?? []);
      setAds(adRes.data ?? []);
      setLogs(logRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const activeCampaigns = campaigns.filter((c) => c.effective_status === "ACTIVE");
  const expiredCampaigns = campaigns.filter((c) => c.effective_status === "CAMPAIGN_PAUSED");
  const totalSpend = campaigns.reduce((s, c) => s + (c.spend || 0), 0);
  const totalImpressions = campaigns.reduce((s, c) => s + (c.impressions || 0), 0);
  const totalClicks = campaigns.reduce((s, c) => s + (c.clicks || 0), 0);
  const totalDailyBudget = activeCampaigns.reduce((s, c) => s + (c.daily_budget || 0), 0);
  const criticalAlerts = logs.filter((l) => l.severity === "critical").length;
  const avgHealth = campaigns.length > 0 ? Math.round(campaigns.reduce((s, c) => s + c.ai_health, 0) / campaigns.length) : 0;

  const filtered = campaigns.filter((c) => {
    if (filter === "active") return c.effective_status === "ACTIVE";
    if (filter === "expired") return c.effective_status === "CAMPAIGN_PAUSED";
    if (filter === "paused") return c.status === "PAUSED" && c.effective_status !== "CAMPAIGN_PAUSED";
    return true;
  });

  function toggle(metaId: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(metaId) ? next.delete(metaId) : next.add(metaId);
      return next;
    });
  }

  return (
    <div className="p-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Ads Command Center</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Serin Tagaytay Staycation &middot; Ad Account 201594077
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-zinc-400 font-medium">AI Workers Active</span>
          </div>
          <span className="text-[10px] text-zinc-600">
            Last sync: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        <SummaryCard label="Active Campaigns" value={String(activeCampaigns.length)} sub={`of ${campaigns.length} total`} color="text-emerald-400" />
        <SummaryCard label="Daily Budget" value={`₱${totalDailyBudget}`} sub="combined active" color="text-blue-400" />
        <SummaryCard label="Total Spend (30d)" value={`₱${totalSpend.toFixed(2)}`} sub="across all" color="text-purple-400" />
        <SummaryCard label="Impressions" value={totalImpressions.toLocaleString()} sub="last 30 days" color="text-cyan-400" />
        <SummaryCard label="Clicks" value={totalClicks.toLocaleString()} sub={totalImpressions > 0 ? `${((totalClicks / totalImpressions) * 100).toFixed(1)}% CTR` : "—"} color="text-amber-400" />
        <SummaryCard label="Account Health" value={`${avgHealth}/100`} sub={avgHealth < 40 ? "needs attention" : "fair"} color={avgHealth >= 70 ? "text-emerald-400" : avgHealth >= 40 ? "text-amber-400" : "text-red-400"} />
        <SummaryCard label="AI Alerts" value={String(criticalAlerts)} sub={criticalAlerts > 0 ? "action needed" : "all clear"} color={criticalAlerts > 0 ? "text-red-400" : "text-emerald-400"} />
      </div>

      {/* AI Worker Alerts */}
      {logs.length > 0 && (
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl mb-6 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">AI Worker Recommendations</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-semibold">
                {logs.length} items
              </span>
            </div>
            <span className="text-[10px] text-zinc-600 uppercase tracking-wider font-semibold">Ad Analyst Worker</span>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {logs.map((log) => (
              <div key={log.id} className="px-4 py-3 flex items-start gap-3 hover:bg-zinc-800/30 transition-colors">
                <div className="mt-1.5"><SeverityIcon severity={log.severity} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      log.severity === "critical" ? "text-red-400" : log.severity === "warning" ? "text-amber-400" : "text-blue-400"
                    }`}>
                      {log.action}
                    </span>
                    {log.target && (
                      <span className="text-[11px] text-zinc-400 font-medium">{log.target}</span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">{log.details}</p>
                </div>
                <span className="text-[10px] text-zinc-600 shrink-0">
                  {new Date(log.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-4">
        {(["all", "active", "expired", "paused"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              filter === f
                ? "bg-blue-500/15 text-blue-400 border border-blue-500/20"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50"
            }`}
          >
            {f === "all" ? `All (${campaigns.length})` :
             f === "active" ? `Active (${activeCampaigns.length})` :
             f === "expired" ? `Expired (${expiredCampaigns.length})` :
             `Paused (${campaigns.filter(c => c.status === "PAUSED" && c.effective_status !== "CAMPAIGN_PAUSED").length})`}
          </button>
        ))}
      </div>

      {/* Main Campaign Table */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] text-zinc-500 uppercase tracking-wider bg-zinc-800/40">
                <th className="p-3 text-left w-8"></th>
                <th className="p-3 text-left">Campaign / Ad Set / Ad</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Objective</th>
                <th className="p-3 text-right">Budget</th>
                <th className="p-3 text-right">Spend</th>
                <th className="p-3 text-right">Impr.</th>
                <th className="p-3 text-right">Clicks</th>
                <th className="p-3 text-right">CTR</th>
                <th className="p-3 text-right">CPC</th>
                <th className="p-3 text-left">Health</th>
                <th className="p-3 text-left">AI Insight</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {filtered.map((c) => {
                const isExpanded = expanded.has(c.meta_id);
                const cAdsets = adsets.filter((a) => a.campaign_meta_id === c.meta_id);
                const hasChildren = cAdsets.length > 0;

                return (
                  <CampaignRows
                    key={c.meta_id}
                    campaign={c}
                    adsets={cAdsets}
                    ads={ads}
                    isExpanded={isExpanded}
                    hasChildren={hasChildren}
                    onToggle={() => toggle(c.meta_id)}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer stats */}
      <div className="mt-4 flex items-center justify-between text-[10px] text-zinc-600">
        <span>Showing {filtered.length} of {campaigns.length} campaigns</span>
        <span>Data synced from Meta Ads API via AI Ad Analyst worker</span>
      </div>
    </div>
  );
}

function CampaignRows({
  campaign: c,
  adsets: cAdsets,
  ads,
  isExpanded,
  hasChildren,
  onToggle,
}: {
  campaign: MetaCampaign;
  adsets: MetaAdSet[];
  ads: MetaAd[];
  isExpanded: boolean;
  hasChildren: boolean;
  onToggle: () => void;
}) {
  return (
    <>
      {/* Campaign row */}
      <tr className={`hover:bg-zinc-800/30 transition-colors ${c.ai_health < 20 ? "bg-red-500/[0.03]" : ""}`}>
        <td className="p-3">
          {hasChildren ? (
            <button onClick={onToggle} className="text-zinc-500 hover:text-white text-xs">
              {isExpanded ? "▼" : "▶"}
            </button>
          ) : (
            <span className="text-zinc-700 text-xs">·</span>
          )}
        </td>
        <td className="p-3">
          <span className="font-medium text-white text-sm">{c.name}</span>
          {c.start_time && (
            <span className="text-[10px] text-zinc-600 ml-2">
              {new Date(c.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
            </span>
          )}
        </td>
        <td className="p-3"><StatusBadge status={c.effective_status || c.status} /></td>
        <td className="p-3"><ObjectiveBadge objective={c.objective} /></td>
        <td className="p-3 text-right font-mono text-zinc-300 text-xs">
          {c.daily_budget ? `₱${c.daily_budget}/d` : c.lifetime_budget ? `₱${c.lifetime_budget}` : "—"}
        </td>
        <td className="p-3 text-right font-mono text-zinc-300 text-xs">
          {c.spend > 0 ? `₱${c.spend.toFixed(2)}` : "₱0"}
        </td>
        <td className="p-3 text-right font-mono text-zinc-300 text-xs">{c.impressions.toLocaleString()}</td>
        <td className="p-3 text-right font-mono text-zinc-300 text-xs">{c.clicks}</td>
        <td className="p-3 text-right font-mono text-zinc-300 text-xs">
          {c.ctr ? `${c.ctr.toFixed(1)}%` : "—"}
        </td>
        <td className="p-3 text-right font-mono text-zinc-300 text-xs">
          {c.cpc ? `₱${c.cpc.toFixed(2)}` : "—"}
        </td>
        <td className="p-3"><HealthBar score={c.ai_health} /></td>
        <td className="p-3">
          <p className="text-[11px] text-zinc-500 max-w-[200px] truncate" title={c.ai_recommendation || ""}>
            {c.ai_recommendation || "—"}
          </p>
        </td>
      </tr>

      {/* Ad Set rows */}
      {isExpanded && cAdsets.map((as) => {
        const asAds = ads.filter((a) => a.adset_meta_id === as.meta_id);
        return (
          <AdSetRows key={as.meta_id} adset={as} ads={asAds} />
        );
      })}
    </>
  );
}

function AdSetRows({ adset: as, ads: asAds }: { adset: MetaAdSet; ads: MetaAd[] }) {
  return (
    <>
      <tr className="bg-zinc-800/20 hover:bg-zinc-800/40 transition-colors">
        <td className="p-3"></td>
        <td className="p-3 pl-8">
          <div className="flex items-center gap-2">
            <span className="text-zinc-600">└</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/50 text-zinc-400 font-semibold">AD SET</span>
            <span className="text-zinc-300 text-xs font-medium">{as.name}</span>
          </div>
          {as.locations && (
            <p className="text-[10px] text-zinc-600 mt-0.5 pl-5">
              Ages {as.age_min}-{as.age_max} · {as.locations} · {as.optimization_goal}
            </p>
          )}
        </td>
        <td className="p-3"><StatusBadge status={as.effective_status || as.status} /></td>
        <td className="p-3">
          <span className="text-[10px] text-zinc-500">{as.optimization_goal}</span>
        </td>
        <td className="p-3 text-right font-mono text-zinc-400 text-xs">
          {as.daily_budget ? `₱${as.daily_budget}/d` : "—"}
        </td>
        <td className="p-3 text-right font-mono text-zinc-400 text-xs">
          {as.spend > 0 ? `₱${as.spend.toFixed(2)}` : "₱0"}
        </td>
        <td className="p-3 text-right font-mono text-zinc-400 text-xs">{as.impressions}</td>
        <td className="p-3 text-right font-mono text-zinc-400 text-xs">{as.clicks}</td>
        <td className="p-3" colSpan={4}></td>
      </tr>
      {asAds.map((ad) => (
        <tr key={ad.meta_id} className="bg-zinc-800/10 hover:bg-zinc-800/30 transition-colors">
          <td className="p-3"></td>
          <td className="p-3 pl-14">
            <div className="flex items-center gap-2">
              <span className="text-zinc-700">└</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-700/40 text-zinc-500 font-semibold">AD</span>
              <span className="text-zinc-400 text-xs">{ad.name}</span>
              {ad.creative_id && (
                <span className="text-[9px] text-zinc-600 font-mono">#{ad.creative_id.slice(-6)}</span>
              )}
            </div>
          </td>
          <td className="p-3"><StatusBadge status={ad.effective_status || ad.status} /></td>
          <td className="p-3"></td>
          <td className="p-3"></td>
          <td className="p-3 text-right font-mono text-zinc-500 text-xs">
            {ad.spend > 0 ? `₱${ad.spend.toFixed(2)}` : "₱0"}
          </td>
          <td className="p-3 text-right font-mono text-zinc-500 text-xs">{ad.impressions}</td>
          <td className="p-3 text-right font-mono text-zinc-500 text-xs">{ad.clicks}</td>
          <td className="p-3" colSpan={4}></td>
        </tr>
      ))}
    </>
  );
}

function SummaryCard({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{label}</p>
      <p className={`text-xl font-bold mt-1 font-mono ${color}`}>{value}</p>
      <p className="text-[10px] text-zinc-600 mt-0.5">{sub}</p>
    </div>
  );
}
