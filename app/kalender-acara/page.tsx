import { getTable } from "@/lib/sheets";
import DataTable from "@/components/DataTable";
import YearCalendar, { type CalEvent } from "@/components/YearCalendar";

export const revalidate = 30;

// Tanggal di sheet bisa "DD/MM/YYYY" (format Indonesia) atau "YYYY-MM-DD". Hasil: "YYYY-MM-DD".
function isoDate(s = ""): string | null {
  const n = s.split(/\D+/).filter(Boolean).map(Number);
  if (n.length < 3) return null;
  const [d, m, y] = n[0] > 31 ? [n[2], n[1], n[0]] : [n[0], n[1], n[2] < 100 ? 2000 + n[2] : n[2]];
  if (!d || !m || !y || m > 12 || d > 31) return null;
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export default async function Page() {
  const t = await getTable("acara");

  // Kolom tanggal acara dan nama acara dideteksi dari judul kolom di sheet.
  const cols = t.cols.filter((c) => c.key !== "A");
  const dateCol = cols.find((c) => /tanggal|tgl|hari/i.test(c.label))?.key ?? t.date;
  const titleCol =
    cols.find((c) => c.key !== dateCol && /nama acara|acara|kegiatan|judul|event/i.test(c.label))?.key ?? t.name;
  const others = cols.filter((c) => c.key !== dateCol && c.key !== titleCol);

  const events: CalEvent[] = t.rows.flatMap((r) => {
    const date = isoDate(r[dateCol]);
    const title = (r[titleCol] ?? "").trim();
    if (!date || !title) return [];
    const detail = others.map((c) => (r[c.key] ?? "").trim()).filter(Boolean).slice(0, 3).join(" · ");
    return [{ date, title, detail }];
  });

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }); // YYYY-MM-DD

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Kalender Acara</h2>
      <YearCalendar events={events} today={today} />
      <div className="space-y-3">
        <h3 className="text-lg font-bold">Daftar acara dari form</h3>
        <DataTable head="bg-sea-100 text-navy-900" cols={t.cols} rows={t.rows} />
      </div>
      <a href="https://forms.gle/w9G7tBxWwaLBW6y59" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-30 rounded-full bg-navy-900 px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:scale-105 hover:bg-sea-600">+ Saran acara</a>
    </div>
  );
}
