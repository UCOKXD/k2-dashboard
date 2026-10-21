"use client";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { Box, Calculator, LineChart } from "lucide-react";

// Kalkulator dari GeoGebra Apps API (gratis untuk pemakaian non-komersial, tanpa API key).
// Skrip dimuat hanya di halaman ini; tiap kalkulator baru dibuat saat tabnya pertama dibuka,
// lalu tetap terpasang supaya isinya tidak hilang saat pindah tab.
type AppName = "scientific" | "graphing" | "3d";
const TABS: { id: AppName; label: string; icon: typeof Box; desc: string }[] = [
  { id: "scientific", label: "Saintifik", icon: Calculator, desc: "Kalkulator saintifik: pecahan, akar, trigonometri, logaritma, statistik." },
  { id: "graphing", label: "Grafik 2D", icon: LineChart, desc: "Gambar grafik fungsi, titik, dan persamaan di bidang koordinat." },
  { id: "3d", label: "Grafik 3D", icon: Box, desc: "Gambar permukaan, bangun ruang, dan grafik tiga dimensi." },
];

type GGBApi = { setSize: (w: number, h: number) => void; remove?: () => void };
declare global {
  interface Window {
    GGBApplet?: new (params: Record<string, unknown>, html5?: boolean) => { inject: (id: string) => void };
  }
}

const heightFor = (w: number) => (w < 640 ? Math.round(Math.min(620, Math.max(460, window.innerHeight - 260))) : 620);

function Applet({ app, ready }: { app: AppName; ready: boolean }) {
  const box = useRef<HTMLDivElement>(null);
  const api = useRef<GGBApi | null>(null);
  const made = useRef(false);
  const id = `ggb-${app}`;

  useEffect(() => {
    if (!ready || made.current || !box.current || !window.GGBApplet) return;
    made.current = true;
    const w = box.current.clientWidth;
    const applet = new window.GGBApplet(
      {
        appName: app,
        width: w,
        height: heightFor(w),
        language: "id",
        showToolBar: app !== "scientific",
        showAlgebraInput: true,
        showMenuBar: false,
        enableShiftDragZoom: true,
        showResetIcon: true,
        enableRightClick: true,
        borderColor: "transparent",
        appletOnLoad: (a: GGBApi) => (api.current = a),
      },
      true,
    );
    applet.inject(id);
  }, [ready, app, id]);

  // Ikuti lebar wadah (rotasi HP, ubah ukuran jendela).
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (api.current && el.clientWidth > 0) api.current.setSize(el.clientWidth, heightFor(el.clientWidth));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={box} className="min-h-[460px] w-full">
      <div id={id} />
    </div>
  );
}

export default function Calculators() {
  const [tab, setTab] = useState<AppName>("scientific");
  const [opened, setOpened] = useState<Set<AppName>>(() => new Set(["scientific"]));
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const pick = useCallback((t: AppName) => {
    setTab(t);
    setOpened((s) => (s.has(t) ? s : new Set(s).add(t)));
  }, []);

  function onKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    const i = TABS.findIndex((t) => t.id === tab);
    const next = TABS[(i + (e.key === "ArrowRight" ? 1 : TABS.length - 1)) % TABS.length].id;
    pick(next);
    document.getElementById(`tab-kalk-${next}`)?.focus();
  }

  const cur = TABS.find((t) => t.id === tab)!;
  return (
    <div className="space-y-5">
      <Script src="https://www.geogebra.org/apps/deployggb.js" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => setFailed(true)} />
      <div role="tablist" aria-label="Pilih kalkulator" onKeyDown={onKey} className="no-scrollbar flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-surface p-1 shadow-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            id={`tab-kalk-${t.id}`}
            role="tab"
            aria-selected={tab === t.id}
            aria-controls={`panel-kalk-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => pick(t.id)}
            className={`flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-sm font-semibold transition ${
              tab === t.id ? "bg-[#0b1e3d] text-white dark:bg-[#2e9be0] dark:text-[#061227]" : "text-ink-3 hover:bg-surface-2 hover:text-ink"
            }`}
          >
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>
      <p className="text-[15px] text-ink-3">{cur.desc}</p>

      <div className="overflow-hidden rounded-k2-lg border border-line bg-[#fff] shadow-2">
        {failed ? (
          <p className="p-8 text-center text-sm font-semibold text-[#b3123a]">Kalkulator GeoGebra gagal dimuat. Periksa koneksi internet, lalu muat ulang halaman.</p>
        ) : (
          TABS.map((t) => (
            <div key={t.id} id={`panel-kalk-${t.id}`} role="tabpanel" aria-labelledby={`tab-kalk-${t.id}`} hidden={tab !== t.id}>
              {opened.has(t.id) && <Applet app={t.id} ready={ready} />}
              {!ready && tab === t.id && <p className="p-6 text-center text-sm text-[#5b6b80]">Memuat kalkulator…</p>}
            </div>
          ))
        )}
      </div>
      <p className="font-mono text-xs text-ink-3">Kalkulator oleh GeoGebra (geogebra.org) · butuh koneksi internet</p>
    </div>
  );
}
