"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { DailyPulse } from "@/lib/supabase";

export default function PerformancePage() {
  const [pulse, setPulse] = useState<DailyPulse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("daily_pulse")
        .select("*")
        .order("date", { ascending: false })
        .limit(30);
      setPulse(data ?? []);
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

  const totalSpend = pulse.reduce((s, p) => s + (p.spend || 0), 0);
  const totalMessages = pulse.reduce((s, p) => s + (p.messages || 0), 0);
  const avgCPM = totalMessages > 0 ? totalSpend / totalMessages : 0;
  const avgCTR =
    pulse.filter((p) => p.ctr).length > 0
      ? pulse.reduce((s, p) => s + (p.ctr || 0), 0) / pulse.filter((p) => p.ctr).length
      : 0;

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Performance</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Daily pulse data from Meta Ads
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
            Period Spend
          </p>
          <p className="text-2xl font-bold mt-1 font-mono text-blue-400">
            ₱{totalSpend.toLocaleString()}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
            Total Messages
          </p>
          <p className="text-2xl font-bold mt-1 font-mono text-emerald-400">
            {totalMessages.toLocaleString()}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
            Avg Cost/Message
          </p>
          <p className="text-2xl font-bold mt-1 font-mono text-amber-400">
            {avgCPM > 0 ? `₱${avgCPM.toFixed(2)}` : "—"}
          </p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
            Avg CTR
          </p>
          <p className="text-2xl font-bold mt-1 font-mono text-zinc-300">
            {avgCTR > 0 ? `${avgCTR.toFixed(2)}%` : "—"}
          </p>
        </div>
      </div>

      {pulse.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500">No performance data yet.</p>
          <p className="text-xs text-zinc-600 mt-1">
            The daily analyst pulse routine writes data here every morning at 7 AM.
          </p>
        </div>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] text-zinc-500 uppercase tracking-wider bg-zinc-800/30">
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Spend</th>
                  <th className="p-4 text-right">Messages</th>
                  <th className="p-4 text-right">Cost/Msg</th>
                  <th className="p-4 text-right">Impressions</th>
                  <th className="p-4 text-right">CTR</th>
                  <th className="p-4">Anomalies</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {pulse.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-800/20">
                    <td className="p-4 font-medium text-white">
                      {new Date(p.date + "T00:00:00").toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="p-4 text-right font-mono text-zinc-300">
                      ₱{(p.spend || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-mono text-zinc-300">
                      {p.messages}
                    </td>
                    <td className="p-4 text-right font-mono text-zinc-300">
                      {p.cost_per_message ? `₱${p.cost_per_message.toFixed(2)}` : "—"}
                    </td>
                    <td className="p-4 text-right font-mono text-zinc-300">
                      {(p.impressions || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-mono text-zinc-300">
                      {p.ctr ? `${p.ctr.toFixed(2)}%` : "—"}
                    </td>
                    <td className="p-4">
                      {p.anomalies && p.anomalies.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.anomalies.map((a, i) => (
                            <span
                              key={i}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400"
                            >
                              {a}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
