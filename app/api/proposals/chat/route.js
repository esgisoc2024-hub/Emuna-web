import { NextResponse } from 'next/server';
import { admin } from '@/lib/supabase';
import { requireAdmin } from '@/lib/auth';
import { SERVICES } from '@/lib/services';
import { PROPOSAL_TOOL } from '@/lib/proposals';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5-5';

const system = (clients, current) => `Sos el asistente comercial de EMUNÁ, un estudio creativo y de marketing digital de Buenos Aires formado por Gise y Esteban. Tu trabajo es armar y corregir propuestas comerciales a partir de las indicaciones del equipo.

Servicios de EMUNÁ:
${SERVICES.map(s => `- ${s.name}: ${s.seo}`).join('\n')}
- Consultoría y optimización: auditorías, diagnóstico online y mejora de conversión.
- SEO y posicionamiento: SEO orgánico, técnico, local y contenidos.
- SEM y Google Ads: búsqueda, Shopping y remarketing.

Cómo escribir:
- Español rioplatense con voseo ("vas a tener", "contás con"), profesional y cercano. Nada de español neutro.
- Frases claras y concretas, sin relleno ni frases hechas de marketing. Que no suene escrito por una IA.
- No uses construcciones del tipo "esto no es X, es Y" ni muletillas como "en el mundo digital de hoy".
- Hablá del cliente y de su negocio, no de lo buenos que somos.

Reglas:
- Siempre respondé llamando a la herramienta guardar_propuesta con la propuesta COMPLETA y actualizada, aunque el pedido sea un cambio chico. Conservá todo lo que el equipo no pidió cambiar.
- Nunca inventes precios, plazos exactos, nombres ni datos del cliente. Si falta un monto, dejalo en null y pedilo en "mensaje".
- Si el pedido es ambiguo, armá igual una primera versión razonable y en "mensaje" contá qué supusiste.
- Si las indicaciones mencionan a alguien de la lista de clientes, usá su id en cliente_id y sus datos.

Clientes del CRM (id | nombre | empresa | email | servicio de interés):
${clients.map(c => `${c.id} | ${c.name || ''} | ${c.company || ''} | ${c.email || ''} | ${c.service || ''}`).join('\n') || '(todavía no hay clientes)'}

${current ? `Propuesta actual (en JSON), sobre la que estás trabajando:\n${JSON.stringify(current)}` : 'Todavía no hay propuesta: armá la primera versión.'}`;

// Indica al panel si la clave de Claude está cargada (no devuelve la clave)
export async function GET(req) {
  const { res } = await requireAdmin(req); if (res) return res;
  return NextResponse.json({ ready: !!process.env.ANTHROPIC_API_KEY, model: MODEL });
}

export async function POST(req) {
  const { res } = await requireAdmin(req); if (res) return res;
  if (!process.env.ANTHROPIC_API_KEY) return NextResponse.json({ error: 'Falta cargar ANTHROPIC_API_KEY en las variables de entorno de Vercel.' }, { status: 500 });

  const { proposalId, message, clientId } = await req.json().catch(() => ({}));
  const text = String(message || '').trim().slice(0, 6000);
  if (!text) return NextResponse.json({ error: 'Escribí qué necesitás' }, { status: 400 });

  const sb = admin();
  let row = null;
  if (proposalId) {
    ({ data: row } = await sb.from('proposals').select('*').eq('id', proposalId).maybeSingle());
    if (!row) return NextResponse.json({ error: 'No encontré la propuesta' }, { status: 404 });
  }
  const { data: clients } = await sb.from('clients').select('id,name,company,email,service').order('created_at', { ascending: false }).limit(200);
  const chosen = clientId && (clients || []).find(c => c.id === clientId);

  const history = (row?.chat || []).slice(-20).map(m => ({ role: m.role, content: m.content }));
  const userText = chosen && !row ? `${text}\n\n(Cliente elegido en el CRM: ${chosen.name}, id ${chosen.id})` : text;

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': process.env.ANTHROPIC_API_KEY, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: MODEL, max_tokens: 8000, system: system(clients || [], row?.content),
      tools: [PROPOSAL_TOOL], tool_choice: { type: 'tool', name: PROPOSAL_TOOL.name },
      messages: [...history, { role: 'user', content: userText }],
    }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error('[proposals/chat] Anthropic:', r.status, j?.error);
    return NextResponse.json({ error: r.status === 401 ? 'La clave de Claude (ANTHROPIC_API_KEY) no es válida.' : 'Claude no pudo responder. Probá de nuevo en un momento.' }, { status: 502 });
  }
  const out = j.content?.find(b => b.type === 'tool_use')?.input;
  if (!out?.propuesta) return NextResponse.json({ error: 'Claude no devolvió una propuesta. Probá reformular el pedido.' }, { status: 502 });

  const p = out.propuesta;
  const validClient = (clients || []).some(c => c.id === out.cliente_id) ? out.cliente_id : (chosen?.id || row?.client_id || null);
  const chat = [...(row?.chat || []), { role: 'user', content: text }, { role: 'assistant', content: out.mensaje || 'Listo, actualicé la propuesta.' }];
  const fields = { content: p, title: p.titulo, client_name: [p.cliente?.nombre, p.cliente?.empresa].filter(Boolean).join(' · ') || null, client_id: validClient, chat, updated_at: new Date().toISOString() };

  const q = row ? sb.from('proposals').update(fields).eq('id', row.id) : sb.from('proposals').insert({ ...fields, subject: p.titulo, status: 'borrador' });
  const { data: saved, error } = await q.select('*').single();
  if (error) { console.error('[proposals/chat] DB:', error); return NextResponse.json({ error: 'No se pudo guardar la propuesta' }, { status: 500 }); }
  return NextResponse.json({ proposal: saved, reply: out.mensaje });
}
