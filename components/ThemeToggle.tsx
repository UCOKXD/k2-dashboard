"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useSyncExternalStore } from "react";

// Tema disimpan di browser (localStorage "k2-theme"); kelas "dark" dipasang di <html> oleh skrip di layout.
const KEY = "k2-theme";
const stored = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);

  // Pengaman: kalau kelas "dark" sempat terhapus (mis. halaman digambar ulang setelah dimuat, atau ekstensi browser),
  // pasang lagi sesuai pilihan yang tersimpan.
  useEffect(() => {
    const html = document.documentElement;
    const sync = () => {
      const want = stored() === "dark";
      if (want !== html.classList.contains("dark")) html.classList.toggle("dark", want);
    };
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(html, { attributes: true, attributeFilter: ["class"] });
    // Ikut berubah kalau tema diganti di tab lain.
    window.addEventListener("storage", sync);
    return () => {
      obs.disconnect();
      window.removeEventListener("storage", sync);
    };
  }, []);

  function toggle() {
    const next = !dark;
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {}
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Ganti ke tema terang" : "Ganti ke tema gelap"}
      title={dark ? "Tema terang" : "Tema gelap"}
      className="grid h-8 w-8 place-items-center rounded-full border border-white/20 bg-white/10 text-white transition hover:bg-white/20"
    >
      {dark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
