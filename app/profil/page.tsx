import PageHero from "@/components/PageHero";
import PeopleBoard, { CawuPicker, MemberBoard } from "@/components/PeopleBoard";
import SectionHead from "@/components/SectionHead";
import { CAWU_MAX, peopleOf, type OrgPeople } from "@/lib/content";
import { getContent } from "@/lib/content-server";

export const revalidate = 30;
export const metadata = { title: "Profil Kelas | K2 PPTI 28" };

export default async function Page({ searchParams }: { searchParams: Promise<{ cawu?: string }> }) {
  const [cawuData, org, sp] = await Promise.all([getContent("cawu"), getContent("org"), searchParams]);
  const boards: Record<number, OrgPeople | null> = {};
  for (let n = 1; n <= CAWU_MAX; n++) boards[n] = n === cawuData.current ? peopleOf(org) : (cawuData.snaps[n] ?? null);
  const want = Number(sp.cawu);
  const cawu = want >= 1 && want <= CAWU_MAX ? want : cawuData.current;
  const filled = Object.keys(boards).map(Number).filter((n) => boards[n]);
  return (
    <>
      <PageHero
        eyebrow="Profil"
        title="Kenalan sama ABSORBING"
        aside={<CawuPicker cawu={cawu} current={cawuData.current} filled={filled} />}
      />
      <div className="space-y-20 py-[clamp(40px,6vw,72px)]">
        <section>
          <SectionHead no="01" label={`Pengurus · CAWU ${cawu}`} title="Pengurus kelas" />
          <PeopleBoard boards={boards} cawu={cawu} current={cawuData.current} />
        </section>
        <section>
          <SectionHead no="02" label="Anggota" title="Semua teman sekelas" />
          <MemberBoard />
        </section>
      </div>
    </>
  );
}
