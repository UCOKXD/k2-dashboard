"use client";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { SessionUser } from "@/lib/admins";

type Auth = {
  user: SessionUser | null;
  ready: boolean; // false selama status login belum diketahui
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const Ctx = createContext<Auth>({ user: null, ready: false, refresh: async () => {}, logout: async () => {} });

export const useAuth = () => useContext(Ctx);

// Status login admin untuk seluruh halaman. Server tetap memeriksa ulang di setiap aksi admin.
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/auth/me", { cache: "no-store" });
      setUser(((await r.json()) as { user: SessionUser | null }).user);
    } catch {
      setUser(null);
    }
    setReady(true);
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setUser(null);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { user: SessionUser | null }) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  return <Ctx.Provider value={{ user, ready, refresh, logout }}>{children}</Ctx.Provider>;
}

// Kirim perubahan ke API admin dan kembalikan pesan error yang ramah.
export async function adminFetch<T = unknown>(url: string, method: "POST" | "PUT" | "DELETE", body?: unknown): Promise<T> {
  const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) throw new Error(data.error ?? "Terjadi kesalahan");
  return data;
}
