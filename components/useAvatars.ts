"use client";
import { useEffect, useSyncExternalStore } from "react";

// Daftar foto profil (absen -> versi) yang dibagi semua komponen; diambil sekali per kunjungan,
// diambil ulang setelah foto diganti (refreshAvatars).
type Map = Record<string, number>;
let map: Map = {};
let loaded = false;
let loading: Promise<void> | null = null;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());

export function refreshAvatars() {
  loading = fetch("/api/avatar", { cache: "no-store" })
    .then((r) => r.json() as Promise<{ avatars?: Map }>)
    .then((d) => {
      map = d.avatars ?? {};
      loaded = true;
      emit();
    })
    .catch(() => {})
    .finally(() => (loading = null));
  return loading;
}

export function useAvatars() {
  const snap = useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => map,
    () => map,
  );
  useEffect(() => {
    if (!loaded && !loading) void refreshAvatars();
  }, []);
  return snap;
}

// URL foto profil untuk nomor absen, atau undefined kalau belum ada foto.
export const avatarSrc = (m: Map, absen: number | null | undefined) => (absen && m[absen] ? `/api/avatar/${absen}?v=${m[absen]}` : undefined);
