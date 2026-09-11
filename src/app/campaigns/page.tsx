"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Campaign } from "@/lib/supabase";

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });
      setCampaigns(data ?? []);
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

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Campaigns</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Meta Ads campaign performance tracker
        </p>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500">No campaigns tracked yet.</p>
          <p className="text-xs text-zinc-600 mt-1">
            Campaigns sync from Meta Ads via the daily pulse routine.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white">{c.name}</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">
                    {c.objective}
                    {c.meta_campaign_id && (
                      <> · Meta ID: {c.meta_campaign_id}</>
                    )}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                    c.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : c.status === "paused"
                      ? "bg-amber-500/10 text-amber-400"
                      : c.status === "completed"
                      ? "bg-blue-500/10 text-blue-400"
                      : "bg-zinc-700/50 text-zinc-400"
                  }`}
                >
                  {c.status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <MetricTile label="Daily Budget" value={c.daily_budget ? `₱${c.daily_budget}` : "—"} />
                <MetricTile label="Total Spend" value={`₱${(c.total_spend || 0).toLocaleString()}`} />
                <MetricTile label="Messages" value={(c.messages || 0).toLocaleString()} />
                <MetricTile
                  label="Cost/Message"
                  value={c.cost_per_message ? `₱${c.cost_per_message.toFixed(2)}` : "—"}
                />
                <MetricTile label="CTR" value={c.ctr ? `${c.ctr.toFixed(2)}%` : "—"} />
              </div>
              {c.last_synced_at && (
                <p className="text-[10px] text-zinc-600 mt-3">
                  Last synced: {new Date(c.last_synced_at).toLocaleString()}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className="text-lg font-bold font-mono text-zinc-200 mt-0.5">
        {value}
      </p>
    </div>
  );
}
