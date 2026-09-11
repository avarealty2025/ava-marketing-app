"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { ContentItem } from "@/lib/supabase";

const PILLARS = ["Unit", "Tagaytay Experience", "Guest Moments", "Offers", "BTS"];
const PILLAR_COLORS: Record<string, string> = {
  Unit: "bg-blue-500/10 text-blue-400",
  "Tagaytay Experience": "bg-emerald-500/10 text-emerald-400",
  "Guest Moments": "bg-purple-500/10 text-purple-400",
  Offers: "bg-amber-500/10 text-amber-400",
  BTS: "bg-pink-500/10 text-pink-400",
};

export default function CalendarPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("content_calendar")
        .select("*")
        .order("scheduled_date", { ascending: true });
      setItems(data ?? []);
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

  const grouped = items.reduce<Record<string, ContentItem[]>>((acc, item) => {
    const key = item.scheduled_date || "Unscheduled";
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Content Calendar</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Serin Tagaytay content pipeline
        </p>
      </div>

      {/* Pillar legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {PILLARS.map((p) => (
          <span
            key={p}
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
              PILLAR_COLORS[p] || "bg-zinc-700/50 text-zinc-400"
            }`}
          >
            {p}
          </span>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
          <p className="text-zinc-500">No content scheduled yet.</p>
          <p className="text-xs text-zinc-600 mt-1">
            The weekly content calendar routine generates items every Monday.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([date, dateItems]) => (
            <div key={date}>
              <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                {date === "Unscheduled"
                  ? "Unscheduled"
                  : new Date(date + "T00:00:00").toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
              </h3>
              <div className="space-y-2">
                {dateItems.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            PILLAR_COLORS[item.pillar] || "bg-zinc-700/50 text-zinc-400"
                          }`}
                        >
                          {item.pillar}
                        </span>
                        <span className="text-[10px] text-zinc-600 uppercase">
                          {item.platform} · {item.format}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-white">
                        {item.title}
                      </p>
                      {item.copy && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                          {item.copy}
                        </p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ml-3 ${
                        item.status === "published"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : item.status === "scheduled"
                          ? "bg-blue-500/10 text-blue-400"
                          : item.status === "approved"
                          ? "bg-purple-500/10 text-purple-400"
                          : item.status === "drafted"
                          ? "bg-amber-500/10 text-amber-400"
                          : "bg-zinc-700/50 text-zinc-400"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
