import { AlarmClock, BookOpen, ClipboardList } from "lucide-react";
import { jam } from "@/lib/time";
import { DIFFICULTY, URGENCY, daysLabel, urgencyOf, type TaskItem } from "@/lib/tasks";

const BULAN = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const fmt = (ymd: string) => {
  const [y, m, d] = ymd.split("-").map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
};

// Peringatan URGENT (merah) + daftar tugas aktif, urut deadline terdekat.
export default function TaskBoard({ tasks, today }: { tasks: TaskItem[]; today: string }) {
  const active = tasks
    .filter((t) => !t.done && urgencyOf(t, today).days >= 0)
    .sort((a, b) => a.deadline.localeCompare(b.deadline) || (a.jam || "99").localeCompare(b.jam || "99"));
  if (!active.length) return null;
  const urgent = active.filter((t) => urgencyOf(t, today).level === "urgent");

  return (
    <div className="space-y-4">
      {urgent.length > 0 && (
        <div className="rounded-3xl border-2 border-red-400 bg-red-50/90 p-4 shadow-[0_20px_45px_rgba(220,38,38,0.25)] backdrop-blur-md sm:p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-black tracking-wider text-red-700">
            <AlarmClock size={18} className="animate-pulse" /> URGENT: deadline 3 hari lagi atau kurang
          </p>
          <ul className="space-y-1.5">
            {urgent.map((t) => {
              const u = urgencyOf(t, today);
              return (
                <li key={t.id} className="flex flex-wrap items-baseline gap-x-2 text-sm text-red-900">
                  <b className="text-base">{t.judul}</b>
                  {t.matkul && <span className="text-red-700">· {t.matkul}</span>}
                  <span className="font-bold text-red-600">
                    · {daysLabel(u.days)} ({fmt(t.deadline)}
                    {t.jam && `, pukul ${jam(t.jam)}`})
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="rounded-3xl border border-white/60 bg-white/70 p-5 shadow-[0_20px_45px_rgba(15,23,42,0.2)] backdrop-blur-md">
        <h3 className="mb-3 flex items-center gap-2 font-bold text-slate-800">
          <ClipboardList size={18} className="text-sea-600" /> Tugas aktif ({active.length})
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {active.map((t) => {
            const u = urgencyOf(t, today);
            return (
              <div key={t.id} className={`rounded-2xl border bg-white/80 p-3.5 shadow-sm ${u.level === "urgent" ? "border-red-300" : "border-slate-200"}`}>
                <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-black tracking-wider ${URGENCY[u.level].chip}`}>{URGENCY[u.level].label}</span>
                  <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${DIFFICULTY[t.difficulty].cls}`}>{DIFFICULTY[t.difficulty].label}</span>
                </div>
                <p className="font-bold text-slate-800">{t.judul}</p>
                {t.matkul && (
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <BookOpen size={11} /> {t.matkul}
                  </p>
                )}
                <p className="mt-1 text-xs text-slate-600">
                  Deadline {fmt(t.deadline)}
                  {t.jam && `, pukul ${jam(t.jam)}`} · <b>{daysLabel(u.days)}</b>
                </p>
                {t.catatan && <p className="mt-1 text-xs text-slate-500">{t.catatan}</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
