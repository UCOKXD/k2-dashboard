"use client";
import { useEffect, useMemo, useState } from "react";
import { PackagePlus, RotateCcw, Search, Trash2, Undo2 } from "lucide-react";
import { adminFetch, useAuth, usePerm } from "@/components/AuthProvider";
import { EMPTY_INV, KONDISI, KONDISI_LABEL, dipinjam, type InvData, type InvItem, type InvLoan, type Kondisi } from "@/lib/inventaris";
import { STUDENTS } from "@/lib/students";
import { Loading, Panel, SaveBar, input, newId, smallBtn } from "@/components/admin/ui";

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
const tglID = (s: string) => (s ? new Date(`${s}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "–");
// Warna kondisi hanya di garis kiri kotak pilihan, supaya daftar pilihannya tetap terbaca di mode terang & gelap.
const KONDISI_CLS: Record<Kondisi, string> = {
  baik: "!border-l-4 !border-l-emerald-500",
  rusak: "!border-l-4 !border-l-amber-500",
  hilang: "!border-l-4 !border-l-rose-500",
};

// Inventaris kelas (Panel Admin): daftar barang + catatan peminjaman. Khusus izin "inventaris" (bawaan IT & Logistik).
export default function InventarisAdmin() {
  const { user } = useAuth();
  const allowed = usePerm("inventaris");
  const [saved, setSaved] = useState<InvData | null>(null);
  const [d, setD] = useState<InvData | null>(null);
  const [status, setStatus] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState("");
  const [showDone, setShowDone] = useState(false);
  const [form, setForm] = useState({ itemId: "", peminjam: "", jumlah: 1, pinjam: today(), rencana: "", catatan: "" });
  const [formErr, setFormErr] = useState("");

  useEffect(() => {
    if (!allowed) return;
    fetch("/api/inventaris", { cache: "no-store" })
      .then(async (r) => {
        const j = (await r.json()) as { data?: InvData; error?: string };
        if (!r.ok || !j.data) throw new Error(j.error ?? "Gagal memuat inventaris");
        setSaved(j.data);
        setD(j.data);
      })
      .catch((e: Error) => setStatus({ type: "err", text: e.message }));
  }, [allowed]);

  const items = useMemo(() => {
    if (!d) return [];
    const k = q.trim().toLowerCase();
    return k ? d.items.filter((it) => `${it.nama} ${it.lokasi} ${it.catatan}`.toLowerCase().includes(k)) : d.items;
  }, [d, q]);

  if (!allowed) return <p className="k2-card p-6 text-sm text-ink-2">Inventaris hanya untuk IT &amp; Logistik dan Admin Website.</p>;
  if (!d) return status ? <p className="k2-card p-6 text-sm font-semibold text-bad">{status.text}</p> : <Loading title="Inventaris" />;

  const dirty = JSON.stringify(saved) !== JSON.stringify(d);
  const setItem = (id: string, patch: Partial<InvItem>) => setD({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
  const setLoan = (id: string, patch: Partial<InvLoan>) => setD({ ...d, loans: d.loans.map((l) => (l.id === id ? { ...l, ...patch } : l)) });
  const nameOf = (id: string) => d.items.find((it) => it.id === id)?.nama ?? "(barang dihapus)";
  const aktif = d.loans.filter((l) => !l.kembali).sort((a, b) => a.pinjam.localeCompare(b.pinjam));
  const selesai = d.loans.filter((l) => l.kembali).sort((a, b) => b.kembali.localeCompare(a.kembali));
  const units = d.items.reduce((n, it) => n + it.jumlah, 0);
  const borrowed = aktif.reduce((n, l) => n + l.jumlah, 0);
  const bad = d.items.filter((it) => it.kondisi !== "baik").length;
  const now = today();

  async function save() {
    setSaving(true);
    setStatus(null);
    try {
      const r = await adminFetch<{ data: InvData }>("/api/inventaris", "PUT", d);
      setSaved(r.data);
      setD(r.data);
      setStatus({ type: "ok", text: "Inventaris tersimpan." });
    } catch (e) {
      setStatus({ type: "err", text: (e as Error).message });
    }
    setSaving(false);
  }

  function addLoan(e: React.FormEvent) {
    e.preventDefault();
    if (!d) return;
    const it = d.items.find((x) => x.id === form.itemId);
    const sisa = it ? it.jumlah - dipinjam(d, it.id) : 0;
    if (!it) return setFormErr("Pilih barangnya dulu.");
    if (!form.peminjam.trim()) return setFormErr("Isi nama peminjam.");
    if (form.jumlah < 1 || form.jumlah > sisa) return setFormErr(`Jumlah tersedia untuk ${it.nama}: ${sisa}.`);
    setFormErr("");
    setD({ ...d, loans: [{ id: newId(), itemId: it.id, peminjam: form.peminjam.trim(), jumlah: form.jumlah, pinjam: form.pinjam || today(), rencana: form.rencana, kembali: "", catatan: form.catatan.trim() }, ...d.loans] });
    setForm({ itemId: "", peminjam: "", jumlah: 1, pinjam: today(), rencana: "", catatan: "" });
  }

  return (
    <div className="space-y-6">
      <Panel title="Inventaris Kelas" desc="Catatan barang milik kelas. Hanya terlihat oleh IT & Logistik dan Admin Website. Jangan lupa tekan Simpan setelah mengubah.">
        <dl className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Jenis barang", d.items.length],
            ["Total unit", units],
            ["Sedang dipinjam", borrowed],
            ["Rusak / hilang", bad],
          ].map(([k, v]) => (
            <div key={k} className="rounded-k2-md border border-line bg-surface-2 px-4 py-3">
              <dt className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-3">{k}</dt>
              <dd className="mt-1 font-display text-2xl font-bold text-ink">{v}</dd>
            </div>
          ))}
        </dl>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setQ("");
              setD({ ...d, items: [{ id: newId(), nama: "", jumlah: 1, kondisi: "baik", lokasi: "", catatan: "" }, ...d.items] });
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0b1e3d] px-4 text-sm font-semibold text-white hover:bg-[#1b3a6b] dark:bg-[#2e9be0] dark:text-[#061227]"
          >
            <PackagePlus size={16} /> Tambah barang
          </button>
          <label className="relative ml-auto w-full sm:w-64">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari barang / lokasi" aria-label="Cari barang" className={`${input} pl-9`} />
          </label>
        </div>

        {d.items.length === 0 ? (
          <p className="rounded-k2-md border border-dashed border-line-strong p-6 text-center text-sm text-ink-3">Belum ada barang. Tekan &ldquo;Tambah barang&rdquo; untuk mulai mencatat.</p>
        ) : (
          <ul className="space-y-2.5">
            {items.map((it) => {
              const out = dipinjam(d, it.id);
              return (
                <li key={it.id} className="grid gap-2 rounded-k2-md border border-line bg-surface p-3 md:grid-cols-[minmax(0,1.6fr)_90px_120px_minmax(0,1fr)_minmax(0,1.3fr)_auto] md:items-center">
                  <input value={it.nama} onChange={(e) => setItem(it.id, { nama: e.target.value })} placeholder="Nama barang" aria-label="Nama barang" maxLength={80} className={`${input} font-semibold`} />
                  <label className="flex items-center gap-1.5">
                    <input type="number" min={0} max={9999} value={it.jumlah} onChange={(e) => setItem(it.id, { jumlah: Math.max(0, Number(e.target.value) || 0) })} aria-label="Jumlah" className={input} />
                    <span className="text-xs text-ink-3 md:hidden">unit</span>
                  </label>
                  <select value={it.kondisi} onChange={(e) => setItem(it.id, { kondisi: e.target.value as Kondisi })} aria-label="Kondisi" className={`${input} font-semibold ${KONDISI_CLS[it.kondisi]}`}>
                    {KONDISI.map((k) => (
                      <option key={k} value={k} className="bg-surface text-ink">
                        {KONDISI_LABEL[k]}
                      </option>
                    ))}
                  </select>
                  <input value={it.lokasi} onChange={(e) => setItem(it.id, { lokasi: e.target.value })} placeholder="Lokasi (mis. lemari kelas)" aria-label="Lokasi" maxLength={80} className={input} />
                  <input value={it.catatan} onChange={(e) => setItem(it.id, { catatan: e.target.value })} placeholder="Catatan" aria-label="Catatan" maxLength={200} className={input} />
                  <div className="flex items-center justify-between gap-2 md:justify-end">
                    <span className={`whitespace-nowrap font-mono text-xs ${out ? "text-accent-ink" : "text-ink-3"}`} title="Tersedia / total">
                      {it.jumlah - out}/{it.jumlah} ada
                    </span>
                    <button
                      type="button"
                      disabled={out > 0}
                      title={out > 0 ? "Masih ada yang dipinjam" : "Hapus barang"}
                      onClick={() => confirm(`Hapus "${it.nama || "barang ini"}" beserta riwayat pinjamnya?`) && setD({ items: d.items.filter((x) => x.id !== it.id), loans: d.loans.filter((l) => l.itemId !== it.id) })}
                      className={`${smallBtn} grid h-9 w-9 place-items-center !p-0 text-bad`}
                      aria-label={`Hapus ${it.nama}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              );
            })}
            {items.length === 0 && <p className="p-4 text-center text-sm text-ink-3">Tidak ada barang yang cocok dengan &ldquo;{q}&rdquo;.</p>}
          </ul>
        )}
      </Panel>

      <Panel title="Peminjaman" desc="Catat siapa yang meminjam barang kelas, lalu tandai saat sudah dikembalikan.">
        <form onSubmit={addLoan} className="grid gap-3 rounded-k2-md border border-line bg-surface-2 p-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-ink-2">Barang</span>
            <select value={form.itemId} onChange={(e) => setForm({ ...form, itemId: e.target.value })} className={input}>
              <option value="">— pilih barang —</option>
              {d.items
                .filter((it) => it.nama && it.kondisi !== "hilang")
                .map((it) => (
                  <option key={it.id} value={it.id} disabled={it.jumlah - dipinjam(d, it.id) < 1}>
                    {it.nama} (ada {it.jumlah - dipinjam(d, it.id)})
                  </option>
                ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-ink-2">Peminjam</span>
            <input value={form.peminjam} onChange={(e) => setForm({ ...form, peminjam: e.target.value })} list="inv-peminjam" placeholder="Nama siswa / dosen" maxLength={80} className={input} />
            <datalist id="inv-peminjam">
              {STUDENTS.map((s) => (
                <option key={s.absen} value={s.full} />
              ))}
            </datalist>
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-ink-2">Jumlah</span>
            <input type="number" min={1} value={form.jumlah} onChange={(e) => setForm({ ...form, jumlah: Math.max(1, Number(e.target.value) || 1) })} className={input} />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-ink-2">Tanggal pinjam</span>
            <input type="date" value={form.pinjam} onChange={(e) => setForm({ ...form, pinjam: e.target.value })} className={input} />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-ink-2">Rencana kembali (opsional)</span>
            <input type="date" value={form.rencana} min={form.pinjam} onChange={(e) => setForm({ ...form, rencana: e.target.value })} className={input} />
          </label>
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-ink-2">Catatan (opsional)</span>
            <input value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} placeholder="mis. untuk presentasi" maxLength={200} className={input} />
          </label>
          <div className="flex flex-wrap items-center gap-3 sm:col-span-2 lg:col-span-3">
            <button className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[#0b1e3d] px-4 text-sm font-semibold text-white hover:bg-[#1b3a6b] dark:bg-[#2e9be0] dark:text-[#061227]">Catat peminjaman</button>
            {formErr && <p className="text-sm font-semibold text-bad">{formErr}</p>}
          </div>
        </form>

        <h3 className="mb-2 mt-6 font-bold text-ink">Sedang dipinjam ({aktif.length})</h3>
        {aktif.length === 0 ? (
          <p className="text-sm text-ink-3">Tidak ada barang yang sedang dipinjam.</p>
        ) : (
          <ul className="space-y-2">
            {aktif.map((l) => {
              const telat = l.rencana && l.rencana < now;
              return (
                <li key={l.id} className={`flex flex-wrap items-center gap-x-4 gap-y-2 rounded-k2-md border p-3 ${telat ? "border-bad bg-[color-mix(in_srgb,var(--bad)_6%,transparent)]" : "border-line bg-surface"}`}>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-ink">
                      {nameOf(l.itemId)} <span className="font-mono text-sm text-ink-3">×{l.jumlah}</span>
                    </p>
                    <p className="text-sm text-ink-2">
                      {l.peminjam} · dipinjam {tglID(l.pinjam)}
                      {l.rencana && <span className={telat ? "font-semibold text-bad" : ""}> · kembali {tglID(l.rencana)}{telat && " (terlambat)"}</span>}
                    </p>
                    {l.catatan && <p className="text-xs text-ink-3">{l.catatan}</p>}
                  </div>
                  <button type="button" onClick={() => setLoan(l.id, { kembali: today() })} className={`${smallBtn} inline-flex items-center gap-1.5 !py-2`}>
                    <Undo2 size={14} /> Sudah kembali
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {selesai.length > 0 && (
          <div className="mt-5">
            <button type="button" onClick={() => setShowDone((v) => !v)} className="text-sm font-semibold text-accent-ink" aria-expanded={showDone}>
              {showDone ? "Sembunyikan" : "Lihat"} riwayat yang sudah kembali ({selesai.length})
            </button>
            {showDone && (
              <ul className="mt-2 divide-y divide-line rounded-k2-md border border-line">
                {selesai.map((l) => (
                  <li key={l.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2.5 text-sm">
                    <span className="min-w-0 flex-1 text-ink-2">
                      <b className="text-ink">{nameOf(l.itemId)}</b> ×{l.jumlah} · {l.peminjam} · {tglID(l.pinjam)} → {tglID(l.kembali)}
                    </span>
                    <button type="button" onClick={() => setLoan(l.id, { kembali: "" })} className="inline-flex items-center gap-1 text-xs font-semibold text-ink-3 hover:text-ink" title="Batalkan tanda kembali">
                      <RotateCcw size={12} /> Batal
                    </button>
                    <button type="button" onClick={() => setD({ ...d, loans: d.loans.filter((x) => x.id !== l.id) })} className="text-xs font-semibold text-bad" aria-label="Hapus catatan">
                      <Trash2 size={13} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Panel>

      {user?.tempPassword && <p className="text-sm font-medium text-amber-700">Ganti password sementara dulu sebelum bisa menyimpan.</p>}
      <SaveBar dirty={dirty} saving={saving} status={status} onSave={save} onReset={() => setD(saved ?? EMPTY_INV)} />
    </div>
  );
}
