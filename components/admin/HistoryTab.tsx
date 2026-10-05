"use client";
import { useEffect, useState } from "react";
import type { HistoryItem } from "@/lib/content";
import { Panel } from "@/components/admin/ui";

const fmt = (iso: string) => new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function HistoryTab() {
  const [items, setItems] = useState<HistoryItem[] | null>(null);
  useEffect(() => {
    fetch("/api/admin/history", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { items?: HistoryItem[] }) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }, []);

  return (
    <Panel title="Riwayat Admin" desc="Siapa mengubah apa, 300 aktivitas terakhir. Hanya terlihat oleh admin.">
      {!items ? (
        <p className="text-sm text-slate-400">Memuat...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-400">Belum ada riwayat.</p>
      ) : (
        <ol className="custom-scrollbar max-h-[600px] divide-y divide-slate-100 overflow-y-auto rounded-2xl border border-slate-200 bg-white">
          {items.map((h, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 py-2.5 text-sm">
              <span>
                <b className="text-slate-800">{h.by}</b> <span className="text-xs text-slate-400">({h.jabatan})</span> <span className="text-slate-600">{h.action}</span>
              </span>
              <span className="text-xs text-slate-400">{fmt(h.at)}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
