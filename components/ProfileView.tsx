"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Pencil, Trash2, Users, X } from "lucide-react";
import { adminFetch, useAuth, usePerm } from "@/components/AuthProvider";
import { StatGroup } from "@/components/IzinStats";
import InstagramButton from "@/components/InstagramButton";
import TikTokButton from "@/components/TikTokButton";
import LinkedInButton from "@/components/LinkedInButton";
import { Loading } from "@/components/admin/ui";

export type ProfileData = {
  absen: number;
  nama: string;
  panggilan: string;
  jabatan: string;
  login: string | null;
  avatar: number | null;
  bio: string;
  ig: string;
  showIg: boolean;
  tt: string;
  showTt: boolean;
  li: string;
  showLi: boolean;
  posts: { id: string; at: string }[];
  stats: { izin: number | null; sakit: number | null; pelanggaran: number | null; poin: number | null };
  own: boolean;
};

export async function fetchProfile(absen: number): Promise<ProfileData> {
  const r = await fetch(`/api/profil/${absen}`, { cache: "no-store" });
  const d = (await r.json()) as ProfileData & { error?: string };
  if (!r.ok) throw new Error(d.error ?? "Gagal memuat profil");
  return d;
}

export const postSrc = (absen: number, id: string) => `/api/profil/foto/${absen}/${id}`;
const tgl = (iso: string) => new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" });
const n = (v: number | null) => (v === null ? "–" : v);

// Halaman profil seorang siswa (bisa dibuka siapa saja, termasuk tamu).
export default function ProfileView({ absen }: { absen: number }) {
  const { user, ready } = useAuth();
  const mod = usePerm("akun"); // pengurus yang boleh menghapus foto tidak pantas
  const [data, setData] = useState<ProfileData | null>(null);
  const [err, setErr] = useState("");
  const [open, setOpen] = useState<number | null>(null);

  const load = useCallback(() => {
    fetchProfile(absen)
      .then(setData)
      .catch((e: Error) => setErr(e.message));
  }, [absen]);
  useEffect(() => {
    if (ready) load();
  }, [ready, user, load]);

  // Lightbox: Esc menutup, panah kiri/kanan berpindah foto.
  useEffect(() => {
    if (open === null || !data) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((i) => (i === null ? i : (i + 1) % data.posts.length));
      if (e.key === "ArrowLeft") setOpen((i) => (i === null ? i : (i + data.posts.length - 1) % data.posts.length));
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, data]);

  if (!ready) return <Loading />;
  if (err) return <p className="k2-card p-6 text-center text-sm font-semibold text-bad">{err}</p>;
  if (!data) return <Loading />;

  async function removePost(id: string) {
    if (!data || !confirm("Hapus foto ini dari profil?")) return;
    try {
      await adminFetch(`/api/profil/foto?id=${id}${data.own ? "" : `&absen=${data.absen}`}`, "DELETE");
      setOpen(null);
      load();
    } catch (e) {
      alert((e as Error).message);
    }
  }

  const canDelete = data.own || !!mod;
  const cur = open !== null ? data.posts[open] : null;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link href="/profil" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
        <Users size={15} /> Semua teman sekelas
      </Link>

      <section className="k2-card flex flex-col gap-6 p-[clamp(20px,3vw,32px)] sm:flex-row sm:items-start">
        <span className="relative grid h-28 w-28 shrink-0 place-items-center self-center overflow-hidden rounded-full bg-gradient-to-br from-sea-500 to-navy-700 font-display text-4xl font-bold text-white ring-4 ring-accent-soft sm:self-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {data.avatar ? <img src={`/api/avatar/${data.absen}?v=${data.avatar}`} alt={`Foto profil ${data.panggilan}`} className="h-full w-full object-cover" /> : data.panggilan[0]}
        </span>
        <div className="min-w-0 flex-1 space-y-3 text-center sm:text-left">
          <div>
            <p className="k2-eyebrow justify-center sm:justify-start">Absen {String(data.absen).padStart(2, "0")}</p>
            <h1 className="mt-2.5 text-[clamp(28px,4vw,40px)] font-extrabold leading-tight tracking-[-0.02em]">{data.nama}</h1>
            <p className="mt-1 text-[15px] text-ink-3">
              {data.panggilan}
              {data.login && <span className="font-mono"> · @{data.login}</span>}
            </p>
          </div>
          <span className="inline-flex rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent-ink">{data.jabatan}</span>
          {data.bio ? <p className="whitespace-pre-line text-[15px] leading-relaxed text-ink-2">{data.bio}</p> : data.own && <p className="text-sm text-ink-3">Belum ada bio.</p>}
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
            {data.ig && (data.showIg || data.own) && <InstagramButton handle={data.ig} />}
            {data.tt && (data.showTt || data.own) && <TikTokButton handle={data.tt} />}
            {data.li && (data.showLi || data.own) && <LinkedInButton handle={data.li} />}
            {data.own && ((data.ig && !data.showIg) || (data.tt && !data.showTt) || (data.li && !data.showLi)) && (
              <span className="self-center text-xs text-ink-3">
                ({[data.ig && !data.showIg && "Instagram", data.tt && !data.showTt && "TikTok", data.li && !data.showLi && "LinkedIn"].filter(Boolean).join(", ")} disembunyikan dari teman)
              </span>
            )}
            {data.own && (
              <Link href="/akun" className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:border-ink-3">
                <Pencil size={15} /> Edit profil
              </Link>
            )}
          </div>
        </div>
      </section>

      <StatGroup
        items={[
          { label: "Izin", value: n(data.stats.izin), unit: "kali" },
          { label: "Izin sakit", value: n(data.stats.sakit), unit: "kali" },
          { label: "Pelanggaran", value: n(data.stats.pelanggaran), unit: data.stats.poin ? `kasus · ${data.stats.poin} poin` : "kasus", bad: !!data.stats.pelanggaran },
        ]}
      />

      <section aria-label="Foto">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold">Foto</h2>
          {data.own && data.posts.length < 3 && (
            <Link href="/akun#foto-profil-feed" className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent-ink">
              <ImagePlus size={15} /> Tambah foto
            </Link>
          )}
        </div>
        {data.posts.length === 0 ? (
          <p className="k2-card p-6 text-center text-sm text-ink-3">{data.own ? "Belum ada foto. Kamu bisa memasang sampai 3 foto." : "Belum ada foto."}</p>
        ) : (
          <ul className="grid grid-cols-3 gap-1.5 sm:gap-3">
            {data.posts.map((p, i) => (
              <li key={p.id}>
                <button type="button" onClick={() => setOpen(i)} className="block aspect-square w-full overflow-hidden rounded-k2-md bg-surface-2" aria-label={`Buka foto ${i + 1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={postSrc(data.absen, p.id)} alt="" loading="lazy" className="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {cur && open !== null && (
        <div role="dialog" aria-modal="true" aria-label="Foto" className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 p-4" onClick={() => setOpen(null)}>
          <button type="button" className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white" aria-label="Tutup" autoFocus>
            <X size={20} />
          </button>
          {data.posts.length > 1 && (
            <>
              <button type="button" onClick={(e) => (e.stopPropagation(), setOpen((open + data.posts.length - 1) % data.posts.length))} className="absolute left-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white" aria-label="Foto sebelumnya">
                <ChevronLeft size={22} />
              </button>
              <button type="button" onClick={(e) => (e.stopPropagation(), setOpen((open + 1) % data.posts.length))} className="absolute right-3 grid h-11 w-11 place-items-center rounded-full bg-white/15 text-white" aria-label="Foto berikutnya">
                <ChevronRight size={22} />
              </button>
            </>
          )}
          <figure className="max-h-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={postSrc(data.absen, cur.id)} alt={`Foto ${data.panggilan}`} className="max-h-[78vh] rounded-k2-lg object-contain" />
            <figcaption className="mt-3 flex items-center justify-center gap-3 text-sm text-white/85">
              <span className="font-mono">{tgl(cur.at)}</span>
              {canDelete && (
                <button type="button" onClick={() => removePost(cur.id)} className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold text-white hover:bg-rose-600">
                  <Trash2 size={14} /> Hapus{!data.own && " (pengurus)"}
                </button>
              )}
            </figcaption>
          </figure>
        </div>
      )}
    </div>
  );
}
