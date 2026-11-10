import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';
import { send } from '@/lib/email';
const one = (v, n) => String(v || '').replace(/[\r\n]+/g, ' ').trim().slice(0, n);
export async function POST(req) {
  const d = await req.json().catch(() => ({}));
  if (d.website) return NextResponse.json({ ok: true }); // trampa anti-spam
  const name = one(d.name, 120), email = one(d.email, 160), message = String(d.message || '').trim().slice(0, 4000);
  if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || message.length < 15)
    return NextResponse.json({ error: 'Datos inválidos' }, { status: 400 });
  const row = { name, email, phone: one(d.phone, 40) || null, company: one(d.company, 120) || null, service: one(d.service, 80) || null, notes: message, source: 'web' };
  const { error } = await admin().from('clients').insert(row);
  if (error) return NextResponse.json({ error: 'No se pudo guardar' }, { status: 500 });
  await Promise.allSettled([
    send({ to: process.env.NOTIFY_EMAIL, subject: `Nuevo contacto: ${name}`, text: `${name} (${email})\n${row.company || ''} ${row.phone || ''}\nÁrea: ${row.service || '-'}\n\n${message}` }),
    send({ to: email, subject: 'Recibimos tu consulta · EMUNÁ', text: `Hola ${name},\n\nGracias por escribirnos. Revisamos tu consulta y te respondemos en menos de 48 horas hábiles.\n\nEquipo EMUNÁ` })
  ]);
  return NextResponse.json({ ok: true });
}
