import { NextResponse } from 'next/server';
import { getUserRole } from '@/lib/auth';
import { canLogin } from '@/lib/roles';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const { user, role } = await getUserRole(req);
  if (!user) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, role, panel: canLogin(role) }, { headers: { 'Cache-Control': 'no-store' } });
}
