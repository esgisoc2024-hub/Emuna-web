import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';
import { send } from '@/lib/email';
import { CONTACT } from '@/lib/services';
import { money, totals } from '@/lib/proposals';
export const dynamic = 'force-dynamic';

// El cliente acepta su propuesta desde la página pública (el código del enlace hace de llave)
export async function POST(req) {
  const { token, name } = await req.json().catch(() => ({}));
  if (!/^[0-9a-f-]{36}$/i.test(token || '')) return NextResponse.json({ error: 'Enlace inválido' }, { status: 400 });
  const sb = admin();
  const { data: p } = await sb.from('proposals').select('id,status,content,client_id,accepted_at,token').eq('token', token).maybeSingle();
  if (!p?.content) return NextResponse.json({ error: 'No encontramos la propuesta' }, { status: 404 });
  if (p.status === 'aceptada') return NextResponse.json({ ok: true, accepted_at: p.accepted_at });
  if (p.status === 'rechazada') return NextResponse.json({ error: 'Esta propuesta ya no está vigente. Escribinos y la actualizamos.' }, { status: 409 });

  const now = new Date().toISOString();
  const who = String(name || '').trim().slice(0, 120);
  const note = `Aceptada desde la web el ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}${who ? ` por ${who}` : ''}.`;
  const { data: cur } = await sb.from('proposals').select('notes').eq('id', p.id).single();
  await sb.from('proposals').update({ status: 'aceptada', accepted_at: now, updated_at: now, notes: [cur?.notes, note].filter(Boolean).join('\n') }).eq('id', p.id);
  if (p.client_id) await sb.from('clients').update({ status: 'propuesta aceptada' }).eq('id', p.client_id);

  // Aviso al equipo (si falla el correo, la aceptación igual queda guardada)
  const c = p.content, t = totals(c.inversion), cur$ = c.inversion?.moneda;
  const total = [t.hasUnico && money(t.unico || null, cur$), t.hasMensual && `${money(t.mensual || null, cur$)} por mes`].filter(Boolean).join(' + ');
  const to = process.env.NOTIFY_EMAIL || process.env.REPLY_TO || CONTACT.email;
  try {
    await send({ to, subject: `🎉 Propuesta aceptada: ${c.titulo}`.slice(0, 200),
      text: `${[c.cliente?.nombre, c.cliente?.empresa].filter(Boolean).join(' · ') || 'El cliente'} aceptó la propuesta "${c.titulo}".${who ? `\nNombre indicado al aceptar: ${who}` : ''}${total ? `\nInversión: ${total}` : ''}\n\nVer la propuesta: ${new URL(req.url).origin}/propuesta/${p.token}\nYa quedó en "Aceptada" en el CRM del panel.` });
  } catch (e) { console.error('[proposals/accept] aviso:', e); }
  return NextResponse.json({ ok: true, accepted_at: now });
}
