'use client';
import { useEffect, useRef, useState } from 'react';
import ProposalDoc from '@/app/components/ProposalDoc';
import HtmlFrame from '@/app/components/HtmlFrame';
import { MAX_HTML_BYTES, htmlTitle } from '@/lib/htmlProposal';
import { STATUSES, statusLabel, money, totals } from '@/lib/proposals';
import '@/app/components/proposal.css';

const IDEAS = [
  'Propuesta de diseño web para Café Bruma, una cafetería de Palermo: landing con menú, reservas por WhatsApp y Instagram. USD 900, unas 4 semanas.',
  'Campañas de Meta Ads para un estudio de pilates en Ituzaingó que quiere sumar alumnas. Gestión mensual ARS 250.000, la inversión en anuncios va aparte.',
  'Branding completo para una marca de velas artesanales que arranca: logo, paleta, tono de voz y 12 piezas para Instagram.',
];
const AI_PROMPT = 'Dame un único archivo HTML completo, con el CSS y el JavaScript incluidos en el mismo archivo. Sin React, sin archivos aparte y sin imágenes locales; si usás imágenes, que sean URLs https. Que se vea bien en el celular y al imprimir.';
const fmtDate = d => d ? new Date(d).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }) : '';
const totalText = c => {
  if (!c?.inversion?.items?.length) return '';
  const t = totals(c.inversion), cur = c.inversion.moneda;
  return [t.hasUnico && money(t.unico || null, cur), t.hasMensual && `${money(t.mensual || null, cur)}/mes`].filter(Boolean).join(' + ');
};

function StatusSelect({ value, onChange }) {
  const s = STATUSES.find(x => x.k === value) || STATUSES[0];
  return <select className="pr-st" value={value} onChange={e => onChange(e.target.value)} style={{ background: s.color, color: s.dark ? '#F7F3EA' : '#2C3320' }}>
    {STATUSES.map(x => <option key={x.k} value={x.k}>{x.label}</option>)}
  </select>;
}

export default function Proposals({ sb, api, clients, flash, onClientsChange }) {
  const [list, setList] = useState([]), [filter, setFilter] = useState('todas'), [open, setOpen] = useState(null);
  const [text, setText] = useState(''), [busy, setBusy] = useState(false), [clientId, setClientId] = useState('');
  const [sending, setSending] = useState(false), [sendTo, setSendTo] = useState(''), [sendMsg, setSendMsg] = useState('');
  const chatEnd = useRef(null);
  const [ready, setReady] = useState(true);
  const EMPTY = { title: '', clientId: '', clientName: '', html: '' };
  const [draft, setDraft] = useState(EMPTY), [preview, setPreview] = useState(''), [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await sb.from('proposals').select('*').order('updated_at', { ascending: false });
    setList(data || []); return data || [];
  };
  useEffect(() => { load(); api('/api/proposals/chat').then(r => r.json()).then(j => setReady(!!j.ready)).catch(() => {}); }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [open?.chat?.length, busy]);

  const current = open && typeof open === 'object' && open.id ? open : null;
  const isHtml = open === 'new-html' || (!!current && !current.content && current.html != null);

  // Al abrir una propuesta HTML, cargo sus datos en el editor
  useEffect(() => {
    if (!isHtml) return;
    const d = current ? { title: current.title || '', clientId: current.client_id || '', clientName: current.client_id ? '' : (current.client_name || ''), html: current.html || '' } : EMPTY;
    setDraft(d); setPreview(d.html);
  }, [current?.id, isHtml]);
  // La vista previa se actualiza un momento después de dejar de escribir
  useEffect(() => { const t = setTimeout(() => setPreview(draft.html), 600); return () => clearTimeout(t); }, [draft.html]);

  const setD = (k, v) => setDraft(d => ({ ...d, [k]: v }));
  const loadFile = async e => {
    const f = e.target.files?.[0]; e.target.value = ''; if (!f) return;
    if (f.size > MAX_HTML_BYTES) return flash('El archivo es muy pesado (máximo 2,9 MB). Probá con imágenes enlazadas en lugar de incrustadas.');
    const html = await f.text();
    setDraft(d => ({ ...d, html, title: d.title || htmlTitle(html) || f.name.replace(/\.html?$/i, '') }));
    flash(`Cargué ${f.name}.`);
  };
  const saveHtml = async e => {
    e?.preventDefault();
    if (!draft.html.trim()) return flash('Pegá el código HTML o subí el archivo.');
    if (new Blob([draft.html]).size > MAX_HTML_BYTES) return flash('El HTML es muy pesado (máximo 2,9 MB). Probá con imágenes enlazadas en lugar de incrustadas.');
    const c = clients.find(x => x.id === draft.clientId);
    const title = draft.title.trim() || htmlTitle(draft.html) || 'Propuesta';
    const fields = { title, subject: title, html: draft.html, client_id: c?.id || null,
      client_name: c ? [c.name, c.company].filter(Boolean).join(' · ') : (draft.clientName.trim() || null), updated_at: new Date().toISOString() };
    setSaving(true);
    const q = current ? sb.from('proposals').update(fields).eq('id', current.id) : sb.from('proposals').insert({ ...fields, status: 'borrador' });
    const { data, error } = await q.select('*').single();
    setSaving(false);
    if (error) return flash('No se pudo guardar la propuesta.');
    flash(current ? 'Cambios guardados.' : 'Propuesta guardada. Ya tiene su enlace para el cliente.');
    setOpen(data); load();
  };
  const dirty = isHtml && current && (draft.html !== (current.html || '') || draft.title !== (current.title || '') || (draft.clientId || null) !== (current.client_id || null) || (!draft.clientId && draft.clientName !== (current.client_name || '')));
  const update = async (id, fields) => {
    const { error } = await sb.from('proposals').update({ ...fields, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) return flash('No se pudo guardar el cambio.');
    const fresh = await load(); if (current?.id === id) setOpen(fresh.find(p => p.id === id) || null);
  };
  const remove = async p => {
    if (!confirm(`¿Eliminar la propuesta "${p.title || 'sin título'}"?`)) return;
    await sb.from('proposals').delete().eq('id', p.id); flash('Propuesta eliminada.'); setOpen(null); load();
  };
  const copyLink = p => { navigator.clipboard?.writeText(`${location.origin}/propuesta/${p.token}`); flash('Enlace copiado.'); };

  const ask = async e => {
    e?.preventDefault(); const msg = text.trim(); if (!msg || busy) return;
    setBusy(true); setText('');
    const optimistic = { ...(current || { chat: [] }), chat: [...(current?.chat || []), { role: 'user', content: msg }] };
    setOpen(optimistic);
    const r = await api('/api/proposals/chat', { method: 'POST', body: JSON.stringify({ proposalId: current?.id, message: msg, clientId: clientId || undefined }) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    if (!r.ok) { flash(j.error || 'Claude no pudo responder.'); setText(msg); setOpen(current || 'new'); return; }
    setOpen(j.proposal); load(); onClientsChange?.();
  };

  const send = async e => {
    e.preventDefault(); flash('Enviando…');
    const r = await api('/api/proposals/send', { method: 'POST', body: JSON.stringify({ proposalId: current.id, email: sendTo, message: sendMsg }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) return flash(j.error || 'No se pudo enviar.');
    flash('Propuesta enviada.'); setSending(false); setSendMsg(''); const fresh = await load(); setOpen(fresh.find(p => p.id === current.id));
  };
  const openSend = () => {
    const c = clients.find(x => x.id === current.client_id);
    setSendTo(c?.email || current.content?.cliente?.email || ''); setSending(true);
  };

  // ---------- Vista de trabajo: chat + vista previa ----------
  if (open) {
    const chat = open.chat || [];
    return (
      <div className="pr-work">
        <div className="pr-bar">
          <button className="btn ghost sm" onClick={() => { if (dirty && !confirm('Tenés cambios sin guardar. ¿Salir igual?')) return; setOpen(null); setSending(false); setClientId(''); }}>← Todas las propuestas</button>
          {current && <div className="pr-actions">
            <StatusSelect value={current.status} onChange={v => update(current.id, { status: v })} />
            <a className="btn ghost sm" href={`/propuesta/${current.token}`} target="_blank" rel="noopener noreferrer">Ver como cliente</a>
            <button className="btn ghost sm" onClick={() => copyLink(current)}>Copiar enlace</button>
            <button className="btn sm" onClick={openSend}>Enviar al cliente</button>
          </div>}
        </div>

        {sending && current && <form className="panel f pr-send" onSubmit={send}>
          <h3 className="full">Enviar "{current.title}"</h3>
          <label className="l full">Email del cliente<input type="email" required value={sendTo} onChange={e => setSendTo(e.target.value)} /></label>
          <label className="l full">Mensaje (opcional, si lo dejás vacío va uno corto con el enlace)<textarea value={sendMsg} onChange={e => setSendMsg(e.target.value)} style={{ minHeight: 90 }} /></label>
          <div className="full" style={{ display: 'flex', gap: '.5rem' }}><button className="btn sm">Enviar correo</button><button type="button" className="btn ghost sm" onClick={() => setSending(false)}>Cancelar</button></div>
        </form>}

        {isHtml ? <div className="pr-grid">
          <form className="pr-chat panel pr-htmlform" onSubmit={saveHtml}>
            <h3>Propuesta en HTML</h3>
            <p className="pr-hint">Pegá el código de una propuesta hecha afuera (o subí el archivo .html). Se guarda en el CRM con su enlace para el cliente, el botón de aceptar y los estados.</p>
            {!current && <div className="pr-tip">
              <div className="pr-tiphead"><strong>¿La vas a generar con una IA?</strong>
                <button type="button" className="btn ghost sm" onClick={() => { navigator.clipboard?.writeText(AI_PROMPT).then(() => flash('Prompt copiado.'), () => flash('No se pudo copiar. Seleccioná el texto y copialo a mano.')); }}>Copiar prompt</button></div>
              <p>Sumale esto a tu pedido para que el código se vea bien acá:</p>
              <blockquote>“{AI_PROMPT}”</blockquote>
            </div>}
            <label className="l">Título<input value={draft.title} onChange={e => setD('title', e.target.value)} placeholder="Ej: Propuesta de web para Café Bruma" /></label>
            <label className="l">Cliente
              <select value={draft.clientId} onChange={e => setD('clientId', e.target.value)}><option value="">Sin vincular a un cliente del CRM</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}</select>
            </label>
            {!draft.clientId && <label className="l">Nombre del cliente (opcional)<input value={draft.clientName} onChange={e => setD('clientName', e.target.value)} placeholder="Nombre o marca" /></label>}
            <div className="pr-codehead"><span>Código HTML</span><label className="btn ghost sm pr-file">Subir archivo .html<input type="file" accept=".html,.htm,text/html" onChange={loadFile} hidden /></label></div>
            <textarea className="pr-code" value={draft.html} onChange={e => setD('html', e.target.value)} spellCheck={false} placeholder={'<!doctype html>\n<html>\n  …pegá acá tu propuesta…\n</html>'} />
            <small className="pr-hint">Las imágenes tienen que estar subidas a internet (con su dirección completa, https://…) o incrustadas en el código. Las rutas de tu computadora no se ven.</small>
            <button className="btn" disabled={saving || (current && !dirty)}>{saving ? 'Guardando…' : current ? (dirty ? 'Guardar cambios' : 'Sin cambios') : 'Guardar propuesta'}</button>
            {current && <label className="l" style={{ marginTop: '1rem' }}>Notas internas (solo las ves vos)
              <textarea defaultValue={current.notes || ''} key={current.id} onBlur={e => e.target.value !== (current.notes || '') && update(current.id, { notes: e.target.value })} style={{ minHeight: 60 }} />
            </label>}
          </form>
          <section className="pr-preview">
            {preview.trim() ? <div className="pr-htmlprev"><HtmlFrame html={preview} minHeight={500} /></div>
              : <div className="pr-ph"><span>✦</span><p>Acá vas a ver la propuesta tal como la va a ver tu cliente apenas pegues el código.</p></div>}
          </section>
        </div> : <div className="pr-grid">
          <section className="pr-chat panel">
            <h3>Chat con Claude</h3>
            {!ready && <p className="pr-warn">Claude todavía no está conectado: falta cargar <b>ANTHROPIC_API_KEY</b> en las variables de entorno de Vercel y volver a publicar.</p>}
            {!current && <label className="l" style={{ marginBottom: '.8rem' }}>Cliente (opcional)
              <select value={clientId} onChange={e => setClientId(e.target.value)}><option value="">Que lo detecte de tus indicaciones</option>{clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}</select>
            </label>}
            <div className="pr-msgs">
              {!chat.length && <div className="pr-empty">
                <p>Contale a Claude para quién es, qué servicios incluye, plazos y precios. Arma la propuesta completa con el diseño de EMUNÁ y después podés pedirle cambios.</p>
                {IDEAS.map(i => <button key={i} type="button" onClick={() => setText(i)}>{i}</button>)}
              </div>}
              {chat.map((m, i) => <div key={i} className={'pr-msg ' + m.role}>{m.content}</div>)}
              {busy && <div className="pr-msg assistant pr-typing">Armando la propuesta<span>…</span></div>}
              <div ref={chatEnd} />
            </div>
            <form className="pr-input" onSubmit={ask}>
              <textarea value={text} onChange={e => setText(e.target.value)} placeholder={current ? 'Pedile cambios: "bajá el precio a USD 800", "sumá una etapa de capacitación"…' : 'Ej: propuesta de web para…'}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } }} disabled={busy} />
              <button className="btn" disabled={busy || !text.trim()}>{busy ? 'Pensando…' : 'Enviar'}</button>
            </form>
            {current && <label className="l" style={{ marginTop: '1rem' }}>Notas internas (solo las ves vos)
              <textarea defaultValue={current.notes || ''} key={current.id} onBlur={e => e.target.value !== (current.notes || '') && update(current.id, { notes: e.target.value })} style={{ minHeight: 60 }} />
            </label>}
          </section>
          <section className="pr-preview">
            {current?.content ? <ProposalDoc p={current.content} date={current.sent_at || current.created_at} />
              : <div className="pr-ph"><span>✦</span><p>La propuesta va a aparecer acá, con el diseño de EMUNÁ, apenas le des las primeras indicaciones a Claude.</p></div>}
          </section>
        </div>}
      </div>
    );
  }

  // ---------- Vista CRM: lista por estado ----------
  const count = k => list.filter(p => p.status === k).length;
  const shown = filter === 'todas' ? list : list.filter(p => p.status === filter);
  return (
    <>
      <div className="pr-head">
        <div className="pr-pills">
          <button className={filter === 'todas' ? 'on' : ''} onClick={() => setFilter('todas')}>Todas <b>{list.length}</b></button>
          {STATUSES.map(s => <button key={s.k} className={filter === s.k ? 'on' : ''} onClick={() => setFilter(s.k)}><i style={{ background: s.color }} />{s.label} <b>{count(s.k)}</b></button>)}
        </div>
        <div className="pr-actions">
          <button className="btn" onClick={() => { setOpen('new'); setText(''); }}>+ Nueva con Claude</button>
          <button className="btn ghost" onClick={() => setOpen('new-html')}>+ Pegar HTML</button>
        </div>
        {!ready && <p className="pr-warn" style={{ width: '100%' }}>Claude todavía no está conectado: falta cargar <b>ANTHROPIC_API_KEY</b> en Vercel (Settings → Environment Variables) y volver a publicar.</p>}
      </div>
      <div className="panel">
        {shown.map(p => <div className="row" key={p.id}>
          <div style={{ cursor: 'pointer', flex: 1, minWidth: 220 }} onClick={() => setOpen(p)}>
            <strong>{p.title || 'Propuesta sin título'}</strong> <span className="pr-kind">{p.html != null && !p.content ? 'HTML' : 'Claude'}</span><br />
            <small>{p.client_name || 'Sin cliente'}{totalText(p.content) && ` · ${totalText(p.content)}`} · Actualizada {fmtDate(p.updated_at)}{p.sent_at && ` · Enviada ${fmtDate(p.sent_at)}`}{p.accepted_at && ` · Aceptada ${fmtDate(p.accepted_at)}`}</small>
          </div>
          <div className="pr-actions">
            <StatusSelect value={p.status} onChange={v => update(p.id, { status: v })} />
            <button className="btn ghost sm" onClick={() => setOpen(p)}>Abrir</button>
            <button className="btn ghost sm" onClick={() => copyLink(p)}>Copiar enlace</button>
            <button className="btn ghost sm" onClick={() => remove(p)}>Eliminar</button>
          </div>
        </div>)}
        {!shown.length && <p>{list.length ? `No hay propuestas en "${statusLabel(filter)}".` : 'Todavía no hay propuestas. Armá una con Claude o pegá el HTML de una que ya tengas.'}</p>}
      </div>
    </>
  );
}
