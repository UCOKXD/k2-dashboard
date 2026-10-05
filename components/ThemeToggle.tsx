"use client";
import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

// Tema disimpan di browser (localStorage "k2-theme"); kelas "dark" dipasang di <html> oleh skrip di layout.
function subscribe(cb: () => void) {
  const obs = new MutationObserver(cb);
  obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => obs.disconnect();
}

export default function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, () => document.documentElement.classList.contains("dark"), () => false);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("k2-theme", next ? "dark" : "light");
    } catch {}
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
