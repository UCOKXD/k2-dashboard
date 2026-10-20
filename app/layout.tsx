import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Shell from "@/components/Shell";

// Font desain v2 (OFL, lisensi di app/fonts/LISENSI.txt), di-host sendiri oleh Next — tanpa permintaan ke Google.
// Nama variabel diberi awalan k2 supaya tidak bertabrakan dengan --font-sans/--font-mono milik Tailwind,
// yang didaftarkan di tailwind.config.ts dari variabel-variabel ini.
const bricolage = localFont({
  src: "./fonts/bricolage-grotesque.woff2",
  weight: "200 800",
  display: "swap",
  variable: "--font-k2-display",
  declarations: [{ prop: "font-stretch", value: "75% 100%" }],
});
const plusJakarta = localFont({ src: "./fonts/plus-jakarta-sans.woff2", weight: "200 800", display: "swap", variable: "--font-k2-sans" });
const jetbrainsMono = localFont({ src: "./fonts/jetbrains-mono.woff2", weight: "100 800", display: "swap", variable: "--font-k2-mono" });

export const metadata: Metadata = {
  title: "K2 PPTI 28",
  description: "Dashboard Divisi K2 - Kesiswaan & Kedisiplinan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning className={`${bricolage.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}>
      <head>
        {/* Pasang tema gelap sebelum halaman tampil supaya tidak berkedip. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("k2-theme");if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="bg-paper font-sans text-ink antialiased">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
