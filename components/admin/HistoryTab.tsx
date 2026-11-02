"use client";
import { useEffect, useState } from "react";
import type { HistoryItem } from "@/lib/content";
import { Panel, Loading } from "@/components/admin/ui";

const fmt = (iso: string) => new Date(iso).toLocaleString("id-ID", { timeZone: "Asia/Jakarta", hourCycle: "h23", day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

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
        <Loading />
      ) : items.length === 0 ? (
        <p className="text-sm text-ink-3">Belum ada riwayat.</p>
      ) : (
        <ol className="custom-scrollbar max-h-[600px] divide-y divide-line overflow-y-auto rounded-2xl border border-line bg-surface">
          {items.map((h, i) => (
            <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 px-4 py-2.5 text-sm">
              <span>
                <b className="text-ink">{h.by}</b> <span className="text-xs text-ink-3">({h.jabatan})</span> <span className="text-ink-2">{h.action}</span>
              </span>
              <span className="text-xs text-ink-3">{fmt(h.at)}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}
