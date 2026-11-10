import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';
import { send } from '@/lib/email';
export async function POST(req) {
  const sb = admin();
  const token = (req.headers.get('authorization') || '').replace('Bearer ', '');
  const { data: { user } } = await sb.auth.getUser(token);
  if (!user || user.email !== process.env.ADMIN_EMAIL) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  const { clientId, subject, body, amount } = await req.json();
  const { data: c } = await sb.from('clients').select('email').eq('id', clientId).single();
  if (!c?.email || !subject || !body) return NextResponse.json({ error: 'Falta cliente, asunto o mensaje' }, { status: 400 });
  const { error } = await send({ to: c.email, subject: String(subject).slice(0, 200), text: body });
  if (error) return NextResponse.json({ error: error.message || 'Resend rechazó el envío' }, { status: 502 });
  await sb.from('proposals').insert({ client_id: clientId, subject, body, amount: amount || null });
  await sb.from('clients').update({ status: 'propuesta enviada' }).eq('id', clientId);
  return NextResponse.json({ ok: true });
}
