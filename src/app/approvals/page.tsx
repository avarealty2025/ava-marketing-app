"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Approval } from "@/lib/supabase";

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [loading, setLoading] = useState(true);

  async function load() {
    let query = supabase.from("approvals").select("*").order("created_at", { ascending: false });
    if (filter !== "all") query = query.eq("status", filter);
    const { data } = await query;
    setApprovals(data ?? []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]);

  async function updateStatus(id: string, status: "approved" | "rejected") {
    await supabase
      .from("approvals")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id);
    await supabase.from("activity_log").insert({
      actor: "Owner",
      action: `${status} approval`,
      details: approvals.find((a) => a.id === id)?.title,
      brand_id: approvals.find((a) => a.id === id)?.brand_id,
    });
    load();
  }

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Approval Queue</h1>
          <p className="text-sm text-zinc-500 mt-1">
            Review and approve AI recommendations
          </p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? "bg-blue-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:text-white"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      ) : approvals.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-zinc-500">No {filter !== "all" ? filter : ""} approvals.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((item) => (
            <div
              key={item.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.priority === "critical"
                          ? "bg-red-500/10 text-red-400"
                          : item.priority === "high"
                          ? "bg-amber-500/10 text-amber-400"
                          : item.priority === "medium"
                          ? "bg-blue-500/10 text-blue-400"
                          : "bg-zinc-700/50 text-zinc-400"
                      }`}
                    >
                      {item.priority}
                    </span>
                    <span
                      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase ${
                        item.category === "campaign"
                          ? "bg-blue-500/10 text-blue-400"
                          : item.category === "budget"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : item.category === "creative"
                          ? "bg-purple-500/10 text-purple-400"
                          : "bg-zinc-700/50 text-zinc-400"
                      }`}
                    >
                      {item.category}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400 mt-1">
                    {item.description}
                  </p>
                  <p className="text-[11px] text-zinc-600 mt-2">
                    Submitted by {item.submitted_by} ·{" "}
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                {item.status === "pending" && (
                  <div className="flex gap-2 ml-4 shrink-0">
                    <button
                      onClick={() => updateStatus(item.id, "approved")}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-500 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(item.id, "rejected")}
                      className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-300 text-xs font-medium hover:bg-zinc-600 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {item.status !== "pending" && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ml-4 ${
                      item.status === "approved"
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-red-500/10 text-red-400"
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
