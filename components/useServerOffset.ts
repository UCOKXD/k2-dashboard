"use client";
import { useEffect, useState } from "react";

// Selisih jam server (/api/time, tersinkron NTP) dengan jam perangkat, dalam ms. 0 sampai hasil pengukuran datang.
// Dipakai supaya penanda "hari ini / sedang berlangsung" tidak bergantung pada jam perangkat yang bisa salah.
export function useServerOffset() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    let alive = true;
    const t0 = Date.now();
    fetch(`/api/time?t=${t0}`, { cache: "no-store" })
      .then((r) => r.json() as Promise<{ now: number }>)
      .then(({ now }) => {
        const t1 = Date.now();
        if (alive && typeof now === "number") setOffset(now + (t1 - t0) / 2 - t1);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return offset;
}

// Hari (0 = Minggu) dan menit sejak tengah malam di Asia/Jakarta untuk waktu epoch `ms`.
export function jktParts(ms: number) {
  const p = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Jakarta", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date(ms));
  const get = (t: string) => p.find((x) => x.type === t)?.value ?? "";
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return { day, min: Number(get("hour")) * 60 + Number(get("minute")) };
}
