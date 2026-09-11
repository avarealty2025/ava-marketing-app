"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Brand, Approval, Campaign, DailyPulse } from "@/lib/supabase";

export default function Dashboard() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [pulse, setPulse] = useState<DailyPulse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [b, a, c, p] = await Promise.all([
        supabase.from("brands").select("*"),
        supabase.from("approvals").select("*").eq("status", "pending").order("created_at", { ascending: false }),
        supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
        supabase.from("daily_pulse").select("*").order("date", { ascending: false }).limit(7),
      ]);
      setBrands(b.data ?? []);
      setApprovals(a.data ?? []);
      setCampaigns(c.data ?? []);
      setPulse(p.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const pendingCount = approvals.length;
  const activeCampaigns = campaigns.filter((c) => c.status === "active").length;
  const totalSpend = campaigns.reduce((s, c) => s + (c.total_spend || 0), 0);
  const totalMessages = campaigns.reduce((s, c) => s + (c.messages || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Command Center</h1>
        <p className="text-sm text-zinc-500 mt-1">
          A.V.A. Realty AI Marketing Engine — Phase 0
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Pending Approvals" value={pendingCount} color={pendingCount > 0 ? "amber" : "green"} />
        <StatCard label="Active Campaigns" value={activeCampaigns} color={activeCampaigns > 0 ? "green" : "zinc"} />
        <StatCard label="Total Spend" value={`₱${totalSpend.toLocaleString()}`} color="blue" />
        <StatCard label="Messages" value={totalMessages.toLocaleString()} color="blue" />
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Brands */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Brands
          </h2>
          <div className="space-y-3">
            {brands.map((brand) => (
              <div key={brand.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{brand.name}</p>
                  <p className="text-[11px] text-zinc-500">
                    Phase {brand.phase} · {brand.autonomy_level}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    brand.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-zinc-700/50 text-zinc-400"
                  }`}
                >
                  {brand.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
              Pending Approvals
            </h2>
            {pendingCount > 0 && (
              <a href="/approvals" className="text-xs text-blue-400 hover:text-blue-300">
                View all →
              </a>
            )}
          </div>
          {approvals.length === 0 ? (
            <p className="text-sm text-zinc-600">All clear — no pending items.</p>
          ) : (
            <div className="space-y-3">
              {approvals.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-zinc-800/40"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          item.priority === "critical"
                            ? "bg-red-500/10 text-red-400"
                            : item.priority === "high"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-zinc-700/50 text-zinc-400"
                        }`}
                      >
                        {item.priority}
                      </span>
                      <span className="text-sm font-medium text-white truncate">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-1 line-clamp-1">
                      {item.description}
                    </p>
                  </div>
                  <span className="text-[10px] text-zinc-600 ml-3 shrink-0">
                    {item.submitted_by}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Campaigns */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Campaigns
          </h2>
          <a href="/campaigns" className="text-xs text-blue-400 hover:text-blue-300">
            Manage →
          </a>
        </div>
        {campaigns.length === 0 ? (
          <p className="text-sm text-zinc-600">No campaigns yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-zinc-500 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Campaign</th>
                  <th className="pb-3 pr-4">Objective</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4 text-right">Budget/Day</th>
                  <th className="pb-3 pr-4 text-right">Spend</th>
                  <th className="pb-3 text-right">Messages</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {campaigns.map((c) => (
                  <tr key={c.id}>
                    <td className="py-3 pr-4 font-medium text-white">{c.name}</td>
                    <td className="py-3 pr-4 text-zinc-400">{c.objective}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          c.status === "active"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : c.status === "paused"
                            ? "bg-amber-500/10 text-amber-400"
                            : "bg-zinc-700/50 text-zinc-400"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-zinc-300">
                      {c.daily_budget ? `₱${c.daily_budget}` : "—"}
                    </td>
                    <td className="py-3 pr-4 text-right font-mono text-zinc-300">
                      ₱{(c.total_spend || 0).toLocaleString()}
                    </td>
                    <td className="py-3 text-right font-mono text-zinc-300">
                      {(c.messages || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* AI Workers */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
          AI Coworker Roster
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { name: "Marketing Director", status: "active" },
            { name: "Creative Director", status: "active" },
            { name: "Copywriter", status: "active" },
            { name: "Ads Manager", status: "active" },
            { name: "Performance Analyst", status: "active" },
            { name: "Content Manager", status: "active" },
            { name: "Lead Gen Manager", status: "standby" },
            { name: "Optimization Mgr", status: "active" },
            { name: "Reporting Manager", status: "active" },
            { name: "Brand Strategist", status: "active" },
          ].map((worker) => (
            <div
              key={worker.name}
              className="p-3 rounded-lg bg-zinc-800/40 text-center"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <div
                  className={`w-1.5 h-1.5 rounded-full ${
                    worker.status === "active" ? "bg-emerald-400" : "bg-zinc-600"
                  }`}
                />
                <span className="text-[10px] text-zinc-500 uppercase">
                  {worker.status}
                </span>
              </div>
              <p className="text-xs font-medium text-zinc-300">{worker.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "green" | "amber" | "blue" | "zinc";
}) {
  const colors = {
    green: "text-emerald-400",
    amber: "text-amber-400",
    blue: "text-blue-400",
    zinc: "text-zinc-400",
  };
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
        {label}
      </p>
      <p className={`text-2xl font-bold mt-1 font-mono ${colors[color]}`}>
        {value}
      </p>
    </div>
  );
}
