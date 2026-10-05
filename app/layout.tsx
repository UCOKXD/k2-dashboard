import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "K2 PPTI 28",
  description: "Dashboard Divisi K2 - Kesiswaan & Kedisiplinan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Pasang tema gelap sebelum halaman tampil supaya tidak berkedip. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("k2-theme");if(t==="dark")document.documentElement.classList.add("dark")}catch(e){}`,
          }}
        />
      </head>
      <body className="font-sans text-navy-900">
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
