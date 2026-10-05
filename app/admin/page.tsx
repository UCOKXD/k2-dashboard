import { Suspense } from "react";
import AdminPanel from "@/components/admin/AdminPanel";
import { storeReady } from "@/lib/store";

export const metadata = { title: "Panel Admin | K2 PPTI 28" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <Suspense>
      <AdminPanel storeReady={storeReady} />
    </Suspense>
  );
}
