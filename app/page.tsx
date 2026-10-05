import Image from "next/image";
import { getTable, isThisMonth, isToday } from "@/lib/sheets";

export const revalidate = 30;

export default async function Home() {
  const [pel, sakit] = await Promise.all([getTable("pelanggaran"), getTable("sakit")]);
  const total = pel.rows.filter((r) => isThisMonth(r[pel.date])).length;
  const hariIni = sakit.rows.filter((r) => isToday(r[sakit.date]));

  return (
    <div className="space-y-8">
      <section className="flex items-center gap-5 rounded-2xl bg-navy-900 p-6 text-white">
        <Image src="/logo-absorbing.jpg" alt="Absorbing PPTI 28" width={96} height={96} className="rounded-full" />
        <div>
          <h2 className="text-2xl font-bold">Selamat datang, Divisi K2</h2>
          <p className="mt-1 text-sm text-sea-100">Pantau pelanggaran, izin, dan jadwal angkatan dalam satu tempat.</p>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-sea-100 bg-white p-6 transition-shadow hover:shadow-md">
          <p className="text-sm text-navy-700">Total pelanggaran bulan ini</p>
          <p className="mt-2 text-4xl font-extrabold text-sea-600">{total}</p>
        </div>
        <div className="rounded-2xl border border-sea-100 bg-white p-6 transition-shadow hover:shadow-md">
          <p className="text-sm text-navy-700">Anak izin sakit hari ini</p>
          <p className="mt-2 text-4xl font-extrabold text-sea-600">{hariIni.length}</p>
          {hariIni.length > 0 && <p className="mt-2 text-sm">{hariIni.map((r) => r[sakit.name]).join(", ")}</p>}
        </div>
      </section>
    </div>
  );
}
