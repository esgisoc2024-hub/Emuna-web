import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';
import { send } from '@/lib/email';
import { requireAdmin } from '@/lib/auth';
const isEmail = e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e || '');

// Envía al cliente el enlace a su propuesta y la marca como "enviada"
export async function POST(req) {
  const { res } = await requireAdmin(req); if (res) return res;
  const sb = admin();
  const { proposalId, email, message } = await req.json().catch(() => ({}));
  const { data: p } = await sb.from('proposals').select('*, clients(name,email)').eq('id', proposalId).maybeSingle();
  if (!p) return NextResponse.json({ error: 'No encontré esa propuesta' }, { status: 404 });

  // Propuesta sin contenido armado con Claude: se envía como correo simple con el mensaje escrito.
  if (!p.content) {
    const toSimple = String(email || p.clients?.email || '').trim();
    if (!isEmail(toSimple)) return NextResponse.json({ error: 'Falta un email válido para el cliente' }, { status: 400 });
    const textSimple = String(message || p.body || '').trim();
    if (!textSimple) return NextResponse.json({ error: 'Escribí el mensaje del correo antes de enviarlo' }, { status: 400 });
    const { error: errSimple } = await send({ to: toSimple, subject: String(p.subject || p.title || 'Propuesta EMUNÁ').slice(0, 200), text: textSimple });
    if (errSimple) return NextResponse.json({ error: errSimple.message || 'No se pudo enviar el correo' }, { status: 502 });
    await sb.from('proposals').update({ status: p.status === 'borrador' ? 'enviada' : p.status, body: textSimple, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', p.id);
    if (p.client_id) await sb.from('clients').update({ status: 'propuesta enviada' }).eq('id', p.client_id);
    return NextResponse.json({ ok: true });
  }
  const to = String(email || p.clients?.email || p.content.cliente?.email || '').trim();
  if (!isEmail(to)) return NextResponse.json({ error: 'Falta un email válido para el cliente' }, { status: 400 });

  const link = `${new URL(req.url).origin}/propuesta/${p.token}`;
  const name = p.content.cliente?.nombre?.split(' ')[0] || p.clients?.name?.split(' ')[0] || '';
  const text = String(message || '').trim() ||
    `Hola${name ? ' ' + name : ''},\n\nTe compartimos la propuesta para "${p.content.titulo}". La podés ver acá:\n${link}\n\nSi tenés dudas o querés ajustar algo, respondé este correo y lo charlamos.\n\nEquipo EMUNÁ`;
  const body = text.includes(link) ? text : `${text}\n\nVer la propuesta: ${link}`;

  const { error } = await send({ to, subject: `Propuesta: ${p.content.titulo}`.slice(0, 200), text: body });
  if (error) return NextResponse.json({ error: error.message || 'No se pudo enviar el correo' }, { status: 502 });

  await sb.from('proposals').update({ status: p.status === 'borrador' ? 'enviada' : p.status, sent_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('id', p.id);
  if (p.client_id) await sb.from('clients').update({ status: 'propuesta enviada' }).eq('id', p.client_id);
  return NextResponse.json({ ok: true, link });
}
