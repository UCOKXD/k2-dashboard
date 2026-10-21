import { notFound } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import { STUDENTS } from "@/lib/students";

export async function generateMetadata({ params }: { params: Promise<{ absen: string }> }) {
  const absen = Number((await params).absen);
  const s = STUDENTS.find((x) => x.absen === absen);
  return { title: `${s ? s.short : "Profil"} | K2 PPTI 28` };
}

export default async function Page({ params }: { params: Promise<{ absen: string }> }) {
  const absen = Number((await params).absen);
  if (!STUDENTS.some((s) => s.absen === absen)) notFound();
  return <ProfileView absen={absen} />;
}
