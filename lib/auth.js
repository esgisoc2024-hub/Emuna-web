import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';

// Lee el token del encabezado Authorization y devuelve el usuario con su rol.
export async function getUserRole(req) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return { user: null, role: null };
  const sb = admin();
  const { data: { user } = {} } = await sb.auth.getUser(token);
  if (!user) return { user: null, role: null };
  const { data } = await sb.from('user_roles').select('role').eq('user_id', user.id).maybeSingle();
  return { user, role: data?.role || null };
}

// Devuelve { user } si es administrador, o { res } con el error para responder.
export async function requireAdmin(req) {
  const { user, role } = await getUserRole(req);
  if (!user) return { res: NextResponse.json({ error: 'Iniciá sesión' }, { status: 401 }) };
  if (role !== 'admin') return { res: NextResponse.json({ error: 'Solo administradores' }, { status: 403 }) };
  return { user };
}
