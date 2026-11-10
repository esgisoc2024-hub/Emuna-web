import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { ROLES } from '@/lib/roles';
export const dynamic = 'force-dynamic';

const adminCount = async sb => (await sb.from('user_roles').select('user_id', { count: 'exact', head: true }).eq('role', 'admin')).count || 0;

// Lista de usuarios con su rol
export async function GET(req) {
  const { res } = await requireAdmin(req); if (res) return res;
  const sb = admin();
  const [{ data: list }, { data: roles }] = await Promise.all([sb.auth.admin.listUsers({ perPage: 200 }), sb.from('user_roles').select('user_id,role')]);
  const byId = Object.fromEntries((roles || []).map(r => [r.user_id, r.role]));
  const users = (list?.users || []).map(u => ({ id: u.id, email: u.email, role: byId[u.id] || 'lector', last_sign_in_at: u.last_sign_in_at, created_at: u.created_at }))
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  return NextResponse.json(users);
}

// Crear usuario con email, contraseña y rol
export async function POST(req) {
  const { res } = await requireAdmin(req); if (res) return res;
  const { email, password, role } = await req.json().catch(() => ({}));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email || '')) return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  if (String(password || '').length < 8) return NextResponse.json({ error: 'La contraseña debe tener al menos 8 caracteres' }, { status: 400 });
  if (!ROLES[role]) return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
  const sb = admin();
  const { data, error } = await sb.auth.admin.createUser({ email: email.trim().toLowerCase(), password, email_confirm: true });
  if (error) return NextResponse.json({ error: /already/i.test(error.message) ? 'Ese email ya tiene usuario' : error.message }, { status: 400 });
  await sb.from('user_roles').upsert({ user_id: data.user.id, email: data.user.email, role });
  return NextResponse.json({ ok: true });
}

// Cambiar el rol de un usuario
export async function PATCH(req) {
  const { user, res } = await requireAdmin(req); if (res) return res;
  const { id, role } = await req.json().catch(() => ({}));
  if (!id || !ROLES[role]) return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  if (id === user.id && role !== 'admin') return NextResponse.json({ error: 'No podés quitarte tu propio rol de administrador' }, { status: 400 });
  const sb = admin();
  const { data: target } = await sb.auth.admin.getUserById(id);
  if (!target?.user) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  const { error } = await sb.from('user_roles').upsert({ user_id: id, email: target.user.email, role });
  if (error) return NextResponse.json({ error: 'No se pudo cambiar el rol' }, { status: 500 });
  return NextResponse.json({ ok: true });
}

// Eliminar un usuario
export async function DELETE(req) {
  const { user, res } = await requireAdmin(req); if (res) return res;
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Falta el usuario' }, { status: 400 });
  if (id === user.id) return NextResponse.json({ error: 'No podés eliminar tu propio usuario' }, { status: 400 });
  const sb = admin();
  const { data: r } = await sb.from('user_roles').select('role').eq('user_id', id).maybeSingle();
  if (r?.role === 'admin' && (await adminCount(sb)) <= 1) return NextResponse.json({ error: 'Tiene que quedar al menos un administrador' }, { status: 400 });
  const { error } = await sb.auth.admin.deleteUser(id);
  if (error) return NextResponse.json({ error: 'No se pudo eliminar' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
