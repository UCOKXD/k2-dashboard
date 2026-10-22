"use client";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AlertTriangle, Download, Mic, Pause, Play, ShieldCheck, Square, Trash2 } from "lucide-react";

// Perekam suara untuk perkuliahan. Semua terjadi di browser: suara tidak pernah dikirim ke server atau database,
// hasilnya langsung diunduh ke perangkat. Rekaman hilang kalau halaman ditutup sebelum diunduh.

type Take = { id: string; title: string; url: string; size: number; ms: number; ext: string; at: Date; saved: boolean };
type State = "idle" | "rec" | "paused" | "saving";

const BITRATE = 64_000; // cukup jernih untuk suara dosen, ±0,5 MB per menit
const TYPES = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4;codecs=mp4a.40.2", "audio/mp4", "audio/ogg;codecs=opus"];
const pickType = () => (typeof MediaRecorder === "undefined" ? "" : (TYPES.find((t) => MediaRecorder.isTypeSupported(t)) ?? ""));
const extOf = (type: string) => (type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm");

const pad = (n: number) => String(n).padStart(2, "0");
function clock(ms: number) {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  return `${h ? `${h}:` : ""}${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
const mb = (b: number) => (b >= 1e6 ? `${(b / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1e3))} KB`);
function stamp(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}.${pad(d.getMinutes())}`;
}
const fileName = (t: Take) => `${(t.title.trim() || "Rekaman kuliah").replace(/[\\/:*?"<>|]+/g, "-").slice(0, 60)} ${stamp(t.at)}.${t.ext}`;

export default function VoiceRecorder() {
  const [state, setState] = useState<State>("idle");
  const [title, setTitle] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [takes, setTakes] = useState<Take[]>([]);
  const [err, setErr] = useState("");
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [deviceId, setDeviceId] = useState("");

  const rec = useRef<MediaRecorder | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const chunks = useRef<Blob[]>([]);
  const audioCtx = useRef<AudioContext | null>(null);
  const meter = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const tick = useRef(0);
  const wake = useRef<WakeLockSentinel | null>(null);
  // Durasi bersih (jeda tidak dihitung): total sebelum jeda terakhir + sejak dilanjutkan.
  const doneMs = useRef(0);
  const since = useRef(0);
  const titleAt = useRef("");

  const supported = useSyncExternalStore(
    () => () => {},
    () => !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== "undefined",
    () => true,
  );

  const loadDevices = useCallback(async () => {
    try {
      const list = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "audioinput" && d.deviceId);
      setDevices(list);
    } catch {}
  }, []);
  useEffect(() => {
    if (!supported) return;
    const t = window.setTimeout(loadDevices);
    navigator.mediaDevices.addEventListener?.("devicechange", loadDevices);
    return () => {
      window.clearTimeout(t);
      navigator.mediaDevices.removeEventListener?.("devicechange", loadDevices);
    };
  }, [supported, loadDevices]);

  // Layar tetap menyala selama merekam (di HP, layar mati bisa menghentikan rekaman).
  const lockScreen = useCallback(async () => {
    try {
      if ("wakeLock" in navigator && !wake.current) {
        wake.current = await navigator.wakeLock.request("screen");
        wake.current.addEventListener("release", () => (wake.current = null));
      }
    } catch {}
  }, []);
  useEffect(() => {
    const onVis = () => document.visibilityState === "visible" && (state === "rec" || state === "paused") && void lockScreen();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [state, lockScreen]);

  // Peringatan sebelum menutup halaman kalau masih merekam atau ada rekaman yang belum diunduh.
  const unsaved = state !== "idle" || takes.some((t) => !t.saved);
  useEffect(() => {
    if (!unsaved) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  const stopMeter = () => {
    cancelAnimationFrame(frame.current);
    if (meter.current) meter.current.style.transform = "scaleX(0)";
  };
  const cleanup = useCallback(() => {
    stopMeter();
    window.clearInterval(tick.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    void audioCtx.current?.close().catch(() => {});
    audioCtx.current = null;
    void wake.current?.release().catch(() => {});
    wake.current = null;
  }, []);

  // Bersihkan saat meninggalkan halaman (pindah menu).
  useEffect(
    () => () => {
      cleanup();
      if (rec.current && rec.current.state !== "inactive") rec.current.stop();
    },
    [cleanup],
  );
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach((u) => URL.revokeObjectURL(u)), []);

  function runMeter() {
    const ctx = audioCtx.current;
    if (!ctx || !stream.current) return;
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    ctx.createMediaStreamSource(stream.current).connect(an);
    const buf = new Uint8Array(an.fftSize);
    const loop = () => {
      an.getByteTimeDomainData(buf);
      let peak = 0;
      for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
      if (meter.current) meter.current.style.transform = `scaleX(${Math.min(1, (peak / 128) * 1.6).toFixed(3)})`;
      frame.current = requestAnimationFrame(loop);
    };
    loop();
  }

  async function start() {
    setErr("");
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: deviceId ? { exact: deviceId } : undefined, echoCancellation: false, noiseSuppression: true, autoGainControl: true },
      });
      stream.current = s;
      void loadDevices(); // nama mikrofon baru terlihat setelah izin diberikan
      const type = pickType();
      const r = new MediaRecorder(s, { ...(type ? { mimeType: type } : {}), audioBitsPerSecond: BITRATE });
      chunks.current = [];
      r.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      r.onstop = () => void finish(r.mimeType || type);
      r.start(1000); // potongan per detik supaya data tidak menumpuk di satu tempat
      rec.current = r;
      titleAt.current = title;
      doneMs.current = 0;
      since.current = performance.now();
      setElapsed(0);
      tick.current = window.setInterval(() => setElapsed(doneMs.current + performance.now() - since.current), 250);
      try {
        audioCtx.current = new AudioContext();
        runMeter();
      } catch {}
      void lockScreen();
      // Kalau mikrofon tiba-tiba terputus (dicabut / diambil aplikasi lain), simpan yang sudah terekam.
      s.getAudioTracks()[0]?.addEventListener("ended", () => {
        setErr("Mikrofon terputus. Rekaman sampai titik ini sudah disimpan di bawah.");
        stop();
      });
      setState("rec");
    } catch (e) {
      cleanup();
      const name = (e as DOMException).name;
      setErr(
        name === "NotAllowedError" || name === "SecurityError"
          ? "Izin mikrofon ditolak. Izinkan mikrofon untuk situs ini di pengaturan browser, lalu coba lagi."
          : name === "NotFoundError" || name === "OverconstrainedError"
            ? "Mikrofon tidak ditemukan. Sambungkan mikrofon atau pilih mikrofon lain."
            : "Tidak bisa mulai merekam. Coba muat ulang halaman.",
      );
    }
  }

  function pause() {
    const r = rec.current;
    if (!r || r.state !== "recording") return;
    r.pause();
    doneMs.current += performance.now() - since.current;
    window.clearInterval(tick.current);
    setElapsed(doneMs.current);
    stopMeter();
    setState("paused");
  }
  function resume() {
    const r = rec.current;
    if (!r || r.state !== "paused") return;
    r.resume();
    since.current = performance.now();
    tick.current = window.setInterval(() => setElapsed(doneMs.current + performance.now() - since.current), 250);
    runMeter();
    setState("rec");
  }
  function stop() {
    const r = rec.current;
    if (!r || r.state === "inactive") return;
    if (r.state === "recording") doneMs.current += performance.now() - since.current;
    setState("saving");
    r.stop();
  }

  async function finish(type: string) {
    const ms = Math.round(doneMs.current);
    cleanup();
    rec.current = null;
    let blob = new Blob(chunks.current, { type: type || "audio/webm" });
    chunks.current = [];
    // Rekaman WebM dari browser tidak menyimpan durasi, jadi pemutar tidak bisa digeser; isi durasinya dulu.
    if (blob.type.includes("webm")) {
      try {
        const fix = (await import("fix-webm-duration")).default;
        blob = await fix(blob, ms, { logger: false });
      } catch {}
    }
    const url = URL.createObjectURL(blob);
    urls.current.push(url);
    setTakes((t) => [{ id: url, title: titleAt.current, url, size: blob.size, ms, ext: extOf(blob.type), at: new Date(), saved: false }, ...t]);
    setElapsed(0);
    setState("idle");
  }

  function download(t: Take) {
    const a = document.createElement("a");
    a.href = t.url;
    a.download = fileName(t);
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTakes((list) => list.map((x) => (x.id === t.id ? { ...x, saved: true } : x)));
  }
  function remove(t: Take) {
    if (!t.saved && !confirm("Rekaman ini belum diunduh. Hapus permanen?")) return;
    URL.revokeObjectURL(t.url);
    setTakes((list) => list.filter((x) => x.id !== t.id));
  }

  const busy = state !== "idle";
  if (!supported)
    return (
      <p className="k2-card mx-auto max-w-xl p-6 text-center text-sm text-ink-2">
        Browser ini belum mendukung perekaman suara. Coba buka lewat Chrome, Edge, Firefox, atau Safari versi terbaru.
      </p>
    );

  return (
    <div className="mx-auto grid max-w-3xl gap-6">
      <section className="k2-card space-y-6 p-[clamp(20px,3vw,32px)]">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="space-y-1.5">
            <span className="block text-sm font-semibold text-ink-2">Judul rekaman (opsional)</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={busy}
              maxLength={60}
              placeholder="mis. Pemrograman Mobile – Pertemuan 5"
              className="min-h-11 w-full rounded-k2-md border border-line-strong bg-surface px-3 text-sm text-ink outline-none focus:border-sea-500 disabled:opacity-60"
            />
          </label>
          {devices.length > 1 && (
            <label className="space-y-1.5">
              <span className="block text-sm font-semibold text-ink-2">Mikrofon</span>
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                disabled={busy}
                className="min-h-11 w-full max-w-[260px] rounded-k2-md border border-line-strong bg-surface px-3 text-sm text-ink disabled:opacity-60"
              >
                <option value="">Bawaan</option>
                {devices.map((d, i) => (
                  <option key={d.deviceId} value={d.deviceId}>
                    {d.label || `Mikrofon ${i + 1}`}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        <div className="flex flex-col items-center gap-5 py-2 text-center">
          <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.14em] text-ink-3" aria-live="polite">
            <span className={`h-2.5 w-2.5 rounded-full ${state === "rec" ? "animate-pulse bg-rose-500" : state === "paused" ? "bg-amber-500" : "bg-line-strong"}`} aria-hidden="true" />
            {state === "rec" ? "Merekam" : state === "paused" ? "Dijeda" : state === "saving" ? "Menyiapkan file…" : "Siap merekam"}
          </p>
          <p className="font-display text-[clamp(56px,12vw,96px)] font-extrabold leading-none tracking-[-0.03em] text-ink tabular-nums" role="timer">
            {clock(elapsed)}
          </p>
          <div className="h-2 w-full max-w-sm overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
            <div ref={meter} className="h-full w-full origin-left scale-x-0 rounded-full bg-gradient-to-r from-sea-500 via-emerald-400 to-amber-400 transition-transform duration-75" />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {state === "idle" && (
              <button
                type="button"
                onClick={start}
                className="inline-flex min-h-14 items-center gap-2.5 rounded-full bg-rose-600 px-8 text-base font-bold text-white shadow-[0_12px_28px_-10px_rgba(225,29,72,0.8)] transition hover:bg-rose-700 active:scale-95"
              >
                <Mic size={20} /> Mulai rekam
              </button>
            )}
            {(state === "rec" || state === "paused") && (
              <>
                <button
                  type="button"
                  onClick={state === "rec" ? pause : resume}
                  className="inline-flex min-h-14 items-center gap-2 rounded-full border border-line-strong bg-surface px-6 text-base font-semibold text-ink transition hover:border-ink-3 active:scale-95"
                >
                  {state === "rec" ? (
                    <>
                      <Pause size={19} /> Jeda
                    </>
                  ) : (
                    <>
                      <Play size={19} /> Lanjut
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={stop}
                  className="inline-flex min-h-14 items-center gap-2 rounded-full bg-[#0b1e3d] px-7 text-base font-bold text-white transition hover:bg-[#1b3a6b] active:scale-95 dark:bg-[#2e9be0] dark:text-[#061227]"
                >
                  <Square size={17} fill="currentColor" /> Selesai
                </button>
              </>
            )}
          </div>
          {err && (
            <p role="alert" className="flex max-w-md items-start gap-2 text-left text-sm font-semibold text-bad">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" /> {err}
            </p>
          )}
        </div>

        <ul className="grid gap-2 rounded-k2-md bg-surface-2 p-4 text-[13px] leading-relaxed text-ink-2 sm:grid-cols-2">
          <li className="flex gap-2">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-ok" /> File langsung tersimpan di perangkatmu.
          </li>
          <li className="flex gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" /> Di HP, tetap buka halaman ini selama merekam. Pindah aplikasi bisa menghentikan rekaman.
          </li>
          <li className="flex gap-2">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" /> Unduh sebelum menutup halaman, rekaman yang belum diunduh akan hilang.
          </li>
          <li className="flex gap-2">
            <Mic size={16} className="mt-0.5 shrink-0 text-accent" /> Ukuran ±0,5 MB per menit (2 jam kuliah ±60 MB).
          </li>
        </ul>
      </section>

      {takes.length > 0 && (
        <section className="space-y-3" aria-label="Rekaman sesi ini">
          <h2 className="text-xl font-bold">Rekaman sesi ini</h2>
          <ul className="space-y-3">
            {takes.map((t) => (
              <li key={t.id} className="k2-card space-y-3 p-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <p className="min-w-0 flex-1 truncate font-semibold text-ink">{t.title.trim() || "Rekaman kuliah"}</p>
                  <p className="font-mono text-xs text-ink-3">
                    {stamp(t.at)} · {clock(t.ms)} · {mb(t.size)}
                  </p>
                </div>
                <audio src={t.url} controls preload="metadata" className="w-full" />
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => download(t)}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
                  >
                    <Download size={16} /> Unduh .{t.ext}
                  </button>
                  {t.saved && <span className="text-xs font-semibold text-ok">Sudah diunduh</span>}
                  <button type="button" onClick={() => remove(t)} className="ml-auto inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-bad hover:bg-surface-2">
                    <Trash2 size={15} /> Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
