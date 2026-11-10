'use client';
import { useEffect, useRef, useState } from 'react';
import ProposalDoc from '@/app/components/ProposalDoc';
import { STATUSES, statusLabel, money, totals } from '@/lib/proposals';
import '@/app/components/proposal.css';

const IDEAS = [
  'Propuesta de diseño web para Café Bruma, una cafetería de Palermo: landing con menú, reservas por WhatsApp y Instagram. USD 900, unas 4 semanas.',
  'Campañas de Meta Ads para un estudio de pilates en Ituzaingó que quiere sumar alumnas. Gestión mensual ARS 250.000, la inversión en anuncios va aparte.',
  'Branding completo para una marca de velas artesanales que arranca: logo, paleta, tono de voz y 12 piezas para Instagram.',
];
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

  const load = async () => {
    const { data } = await sb.from('proposals').select('*').order('updated_at', { ascending: false });
    setList(data || []); return data || [];
  };
  useEffect(() => { load(); api('/api/proposals/chat').then(r => r.json()).then(j => setReady(!!j.ready)).catch(() => {}); }, []);
  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [open?.chat?.length, busy]);

  const current = open && open !== 'new' && open.id ? open : null;
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
          <button className="btn ghost sm" onClick={() => { setOpen(null); setSending(false); setClientId(''); }}>← Todas las propuestas</button>
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

        <div className="pr-grid">
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
        </div>
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
        <button className="btn" onClick={() => { setOpen('new'); setText(''); }}>+ Nueva propuesta con Claude</button>
        {!ready && <p className="pr-warn" style={{ width: '100%' }}>Claude todavía no está conectado: falta cargar <b>ANTHROPIC_API_KEY</b> en Vercel (Settings → Environment Variables) y volver a publicar.</p>}
      </div>
      <div className="panel">
        {shown.map(p => <div className="row" key={p.id}>
          <div style={{ cursor: 'pointer', flex: 1, minWidth: 220 }} onClick={() => setOpen(p)}>
            <strong>{p.title || 'Propuesta sin título'}</strong><br />
            <small>{p.client_name || 'Sin cliente'}{totalText(p.content) && ` · ${totalText(p.content)}`} · Actualizada {fmtDate(p.updated_at)}{p.sent_at && ` · Enviada ${fmtDate(p.sent_at)}`}{p.accepted_at && ` · Aceptada ${fmtDate(p.accepted_at)}`}</small>
          </div>
          <div className="pr-actions">
            <StatusSelect value={p.status} onChange={v => update(p.id, { status: v })} />
            <button className="btn ghost sm" onClick={() => setOpen(p)}>Abrir</button>
            <button className="btn ghost sm" onClick={() => copyLink(p)}>Copiar enlace</button>
            <button className="btn ghost sm" onClick={() => remove(p)}>Eliminar</button>
          </div>
        </div>)}
        {!shown.length && <p>{list.length ? `No hay propuestas en "${statusLabel(filter)}".` : 'Todavía no hay propuestas. Tocá "Nueva propuesta con Claude" y contale qué necesitás.'}</p>}
      </div>
    </>
  );
}
