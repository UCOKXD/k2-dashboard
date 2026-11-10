"use client";
import { useRef, useState } from "react";

type Tautan = { label: string; href: string };

// Layar menu & kontak (seperti "Contact us" dan menu di inherited.band).
// Dua pemicu: "KONTAK" di layar lebar, "MENU" di HP (di HP daftar bagian pindah ke sini supaya tombolnya cukup besar).
// Memakai <dialog>: fokus terkunci di dalam, Esc menutup, fokus kembali ke tombol.
// Email bisa disalin dengan sekali klik; kalau email kosong, yang tampil tautan sosial.
export default function Kontak({ email, tautan, untuk, menu }: { email: string; tautan: Tautan[]; untuk: string[]; menu: Tautan[] }) {
  const dlg = useRef<HTMLDialogElement>(null);
  const [tersalin, setTersalin] = useState(false);
  const buka = () => dlg.current?.showModal();
  const tutup = () => dlg.current?.close();

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setTersalin(true);
      window.setTimeout(() => setTersalin(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <>
      <button type="button" onClick={buka} className="pf-chrome-link max-md:!hidden">
        KONTAK
      </button>
      <button type="button" onClick={buka} className="pf-chrome-link md:!hidden">
        MENU
      </button>
      <dialog
        ref={dlg}
        aria-labelledby="judul-kontak"
        className="pf-kontak m-0 h-[100svh] max-h-none w-screen max-w-none bg-[#061227] p-0 text-[#eef3f8]"
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto px-4 py-2 md:px-10 md:py-5">
          <div className="flex items-center justify-between">
            <p id="judul-kontak" className="pf-mini">
              MENU & KONTAK
            </p>
            <button type="button" onClick={tutup} className="pf-chrome-link" autoFocus>
              TUTUP
            </button>
          </div>

          <nav aria-label="Bagian halaman" className="my-6">
            <ul>
              {menu.map((m) => (
                <li key={m.href}>
                  <a href={m.href} onClick={tutup} className="pf-tebal inline-block py-1 text-[clamp(34px,7vw,88px)] hover:text-[#8fcff1]">
                    {m.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="pb-4">
            <ul className="pf-peran mb-4 flex flex-col">
              {untuk.map((u, i) => (
                <li key={u} style={{ paddingLeft: `${[0, 3, 1.2][i % 3]}em` }}>
                  {u}
                </li>
              ))}
            </ul>
            {email && (
              <button type="button" onClick={salin} className="mb-3 block min-h-11 text-left">
                <span className="pf-garis-putus text-[clamp(18px,3vw,34px)] font-semibold">{email}</span>
                <span className="pf-mini mt-2 block text-[#93a4bc]" aria-live="polite">
                  {tersalin ? "TERSALIN KE CLIPBOARD" : "KLIK UNTUK MENYALIN"}
                </span>
              </button>
            )}
            <ul className="flex flex-wrap gap-x-6">
              {tautan.map((t) => (
                <li key={t.href}>
                  <a href={t.href} target="_blank" rel="noopener noreferrer" className="pf-peran pf-garis-putus inline-flex min-h-11 items-center">
                    {t.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </dialog>
    </>
  );
}
