import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 700: "#1B3A6B", 800: "#12294F", 900: "#0B1E3D" },
        sea: { 50: "#F1F8FD", 100: "#D6EEFB", 300: "#8FCFF1", 500: "#2E9BE0", 600: "#1F7DBA" },
        axo: { 300: "#F8C3CF", 500: "#F08CA3" },
      },
    },
  },
} satisfies Config;
