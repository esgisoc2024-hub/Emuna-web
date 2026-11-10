import { money, totals } from '@/lib/proposals';
import { CONTACT } from '@/lib/services';

// Plantilla única de propuesta EMUNÁ. Recibe el contenido estructurado que arma Claude.
export default function ProposalDoc({ p, date }) {
  if (!p) return null;
  const cur = p.inversion?.moneda || 'ARS';
  const t = totals(p.inversion);
  const fecha = new Date(date || Date.now()).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' });
  const sections = [
    p.introduccion && ['Para empezar', <p className="pd-intro">{p.introduccion}</p>],
    p.objetivos?.length && ['Qué queremos lograr', <ul className="pd-obj">{p.objetivos.map((o, i) => <li key={i}>{o}</li>)}</ul>],
    p.servicios?.length && ['Qué vamos a hacer', <div className="pd-srv">{p.servicios.map((s, i) => (
      <article key={i}><h4>{s.nombre}</h4><p>{s.descripcion}</p>{s.entregables?.length > 0 && <ul>{s.entregables.map((e, k) => <li key={k}>{e}</li>)}</ul>}</article>))}</div>],
    p.etapas?.length && ['Cómo lo vamos a trabajar', <ol className="pd-steps">{p.etapas.map((e, i) => (
      <li key={i}><div><h4>{e.nombre}</h4>{e.duracion && <span>{e.duracion}</span>}</div><p>{e.descripcion}</p></li>))}</ol>],
    p.inversion?.items?.length && ['Inversión', <div className="pd-inv">
      <table><tbody>{p.inversion.items.map((it, i) => (
        <tr key={i}><td><strong>{it.concepto}</strong>{it.detalle && <small>{it.detalle}</small>}</td>
          <td className="m">{money(it.monto, cur)}{it.periodicidad === 'mensual' && <small>por mes</small>}</td></tr>))}</tbody></table>
      <div className="pd-tot">
        {t.hasUnico && <div><span>Total{t.hasMensual ? ' pago único' : ''}</span><b>{t.pending && !t.unico ? 'A definir' : money(t.unico, cur)}</b></div>}
        {t.hasMensual && <div><span>Total mensual</span><b>{t.pending && !t.mensual ? 'A definir' : money(t.mensual, cur)}</b></div>}
      </div>
      {t.pending && <p className="pd-note">Los conceptos marcados "A definir" se confirman antes de arrancar.</p>}
      {p.inversion.forma_de_pago && <p className="pd-note"><strong>Forma de pago:</strong> {p.inversion.forma_de_pago}</p>}
      {p.inversion.nota && <p className="pd-note">{p.inversion.nota}</p>}
    </div>],
    p.condiciones?.length && ['Condiciones', <ul className="pd-list">{p.condiciones.map((c, i) => <li key={i}>{c}</li>)}</ul>],
    p.proximos_pasos?.length && ['Próximos pasos', <ol className="pd-next">{p.proximos_pasos.map((c, i) => <li key={i}>{c}</li>)}</ol>],
  ].filter(Boolean);

  return (
    <div className="pd">
      <header className="pd-cover">
        <div className="pd-top"><span className="pd-logo">EMUNÁ<b>.</b></span><span>Estudio creativo · Buenos Aires</span></div>
        <span className="pd-tag">Propuesta</span>
        <h1>{p.titulo}</h1>
        <dl className="pd-meta">
          <div><dt>Para</dt><dd>{[p.cliente?.nombre, p.cliente?.empresa].filter(Boolean).join(' · ') || '—'}</dd></div>
          <div><dt>Fecha</dt><dd>{fecha}</dd></div>
          <div><dt>Validez</dt><dd>{p.validez_dias || 15} días</dd></div>
        </dl>
      </header>
      {sections.map(([title, body], i) => (
        <section className="pd-sec" key={title}>
          <h3><span>{String(i + 1).padStart(2, '0')}</span>{title}</h3>
          {body}
        </section>
      ))}
      <footer className="pd-end">
        <p className="pd-thanks">Gracias por pensarnos para tu proyecto.</p>
        <p>Cualquier duda, escribinos a <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a> o por <a href={`https://wa.me/${CONTACT.whatsapp}`}>WhatsApp</a>.</p>
        <span className="pd-logo">EMUNÁ<b>.</b></span>
      </footer>
    </div>
  );
}
