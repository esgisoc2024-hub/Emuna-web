'use client';
import { useState } from 'react';

export default function AcceptBox({ token, status, acceptedAt, whatsapp, title }) {
  const [state, setState] = useState(status === 'aceptada' ? 'done' : 'idle');
  const [when, setWhen] = useState(acceptedAt), [name, setName] = useState(''), [err, setErr] = useState('');
  const wa = `https://wa.me/${whatsapp}?text=${encodeURIComponent(`Hola EMUNÁ, tengo una consulta sobre la propuesta "${title}".`)}`;

  if (status === 'rechazada') return null;
  if (state === 'done') return (
    <div className="pa pa-ok">
      <span className="pa-tag">¡Gracias!</span>
      <h2>Propuesta aceptada</h2>
      <p>{when ? `La aceptaste el ${new Date(when).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', timeZone: 'America/Argentina/Buenos_Aires' })}. ` : ''}Ya nos llegó el aviso y te vamos a escribir para coordinar el arranque.</p>
    </div>
  );

  const accept = async e => {
    e.preventDefault(); setState('sending'); setErr('');
    const r = await fetch('/api/proposals/accept', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, name }) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErr(j.error || 'No pudimos registrar la aceptación. Probá de nuevo o escribinos.'); setState('confirm'); return; }
    setWhen(j.accepted_at); setState('done');
  };

  return (
    <div className="pa">
      <span className="pa-tag">¿Te cierra?</span>
      <h2>Si está todo bien, aceptala y arrancamos</h2>
      {state === 'idle' ? (
        <div className="pa-row">
          <button className="pa-btn" onClick={() => setState('confirm')}>Aceptar propuesta</button>
          <a className="pa-btn ghost" href={wa} target="_blank" rel="noopener noreferrer">Tengo dudas o quiero cambios</a>
        </div>
      ) : (
        <form className="pa-form" onSubmit={accept}>
          <label>Tu nombre<input value={name} onChange={e => setName(e.target.value)} required maxLength={120} placeholder="Nombre y apellido" /></label>
          <div className="pa-row">
            <button className="pa-btn" disabled={state === 'sending'}>{state === 'sending' ? 'Enviando…' : 'Confirmar aceptación'}</button>
            <button type="button" className="pa-btn ghost" onClick={() => setState('idle')}>Volver</button>
          </div>
          {err && <p className="pa-err">{err}</p>}
        </form>
      )}
    </div>
  );
}
