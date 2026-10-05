import type { Metadata } from "next";
import "./globals.css";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: "K2 PPTI 28",
  description: "Dashboard Divisi K2 - Kesiswaan & Kedisiplinan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`font-sans bg-sea-50 text-navy-900`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
