import { NextResponse } from "next/server";
import { currentAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await currentAdmin().catch(() => null);
  if (!me) return NextResponse.json({ user: null });
  const { admin: _admin, ...user } = me; // eslint-disable-line @typescript-eslint/no-unused-vars
  return NextResponse.json({ user }, { headers: { "Cache-Control": "no-store" } });
}
