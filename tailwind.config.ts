import type { Config } from "tailwindcss";

// Token desain v2 "Laut Dalam, Buletin Kelas". Nilai merek lama tetap; yang baru hanya ditambah.
// Permukaan, tinta, dan status memakai CSS variable (lihat app/globals.css) supaya mode gelap cukup
// ditukar di satu tempat, yaitu kelas .dark di <html>.
const v = (name: string) => `var(--${name})`;

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 700: "#1B3A6B", 800: "#12294F", 900: "#0B1E3D", 950: "#061227" },
        sea: { 50: "#F1F8FD", 100: "#D6EEFB", 300: "#8FCFF1", 500: "#2E9BE0", 600: "#1F7DBA", 700: "#165F93" },
        axo: { 100: "#FDE8EE", 300: "#F8C3CF", 500: "#F08CA3" },
        paper: v("paper"),
        surface: { DEFAULT: v("surface"), 2: v("surface-2") },
        line: { DEFAULT: v("line"), strong: v("line-strong") },
        ink: { DEFAULT: v("ink"), 2: v("ink-2"), 3: v("ink-3") },
        accent: { DEFAULT: v("accent"), ink: v("accent-ink"), soft: v("accent-soft") },
        ok: { DEFAULT: v("ok"), soft: v("ok-soft") },
        warn: { DEFAULT: v("warn"), soft: v("warn-soft") },
        bad: { DEFAULT: v("bad"), soft: v("bad-soft") },
      },
      fontFamily: {
        display: ["var(--font-k2-display)", "var(--font-k2-sans)", "system-ui", "sans-serif"],
        sans: ["var(--font-k2-sans)", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["var(--font-k2-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "Consolas", "monospace"],
      },
      boxShadow: { 1: v("shadow-1"), 2: v("shadow-2"), 3: v("shadow-3") },
      // Nama baru (k2-*) supaya rounded-lg/xl bawaan Tailwind yang sudah dipakai di banyak tempat tidak ikut berubah.
      borderRadius: { "k2-sm": "6px", "k2-md": "10px", "k2-lg": "16px", "k2-xl": "24px", pill: "999px" },
      transitionTimingFunction: { k2: "cubic-bezier(.2,.7,.2,1)" },
      maxWidth: { wadah: "1200px" },
    },
  },
} satisfies Config;
