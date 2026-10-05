import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Shell from "@/components/Shell";

const font = Plus_Jakarta_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "K2 PPTI 28",
  description: "Dashboard Divisi K2 - Kesiswaan & Kedisiplinan",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className={`${font.className} bg-sea-50 text-navy-900`}>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
