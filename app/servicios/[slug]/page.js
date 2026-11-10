import { notFound } from 'next/navigation';
import { SERVICES, CONTACT, getService } from '@/lib/services';
import '../servicios.css';

export const dynamicParams = false;
export const generateStaticParams = () => SERVICES.map(s => ({ slug: s.slug }));

export async function generateMetadata({ params }) {
  const s = getService((await params).slug);
  if (!s) return {};
  const title = `${s.name} · EMUNÁ`;
  return { title, description: s.seo, openGraph: { title, description: s.seo, type: 'website' }, alternates: { canonical: `/servicios/${s.slug}` } };
}

export default async function Servicio({ params }) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const contact = `/?servicio=${encodeURIComponent(s.form)}#contacto`;
  const wa = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(`Hola EMUNÁ, quiero consultar por ${s.name}.`)}`;
  const others = SERVICES.filter(o => o.slug !== s.slug);
  const schema = {
    '@context': 'https://schema.org', '@type': 'Service', name: s.name, description: s.seo, areaServed: 'Argentina',
    provider: { '@type': 'Organization', name: 'EMUNÁ', email: CONTACT.email },
  };

  return (
    <div className="sp">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Caveat+Brush&family=Fraunces:ital,wght@1,400;1,600&display=swap" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <header className="s-hd"><div className="w">
        <a href="/" className="s-logo" aria-label="EMUNÁ, inicio"><img src="/logo-horizontal.svg" alt="EMUNÁ" width="157" height="46" /></a>
        <nav aria-label="Principal">
          <a className="lk" href="/#servicios">Servicios</a>
          <a className="lk" href="/casos">Casos</a>
          <a className="s-btn sm" href={contact}>Agendar reunión</a>
        </nav>
      </div></header>

      <main>
        <section className="s-hero"><div className="w">
          <div>
            <p className="s-crumb"><a href="/">Inicio</a> / <a href="/#servicios">Servicios</a> / {s.name}</p>
            <span className="tag">Servicio {s.n}</span>
            <h1>{s.title} <span className="ital">{s.titleItal}</span></h1>
            <p className="lead">{s.lead}</p>
            <div className="s-cta">
              <a className="s-btn" href={contact}>{s.cta} →</a>
              <a className="s-btn ghost" href={wa} target="_blank" rel="noopener noreferrer">Escribinos por WhatsApp</a>
            </div>
          </div>
          <div className={`s-badge c-${s.color}`} aria-hidden="true">
            <span className="n">{s.n}</span>
            <h3>{s.name}</h3>
            <ul className="s-chips">{s.chips.map(c => <li key={c}>{c}</li>)}</ul>
          </div>
        </div></section>

        <div className="s-mq" aria-hidden="true"><div>{[...s.marquee, ...s.marquee].map((m, i) => <span key={i}>{m}</span>)}</div></div>

        <section className="s-sec"><div className="w">
          <span className="tag">¿Es para vos?</span>
          <h2>Te va a servir <span className="ital">si…</span></h2>
          <div className="s-who">{s.forWho.map(t => <p key={t}>{t}</p>)}</div>
        </div></section>

        <section className="s-sec" style={{ paddingTop: 0 }}><div className="w">
          <span className="tag">Qué incluye</span>
          <h2>Todo lo que <span className="ital">hacemos por vos</span></h2>
          <div className="s-inc">{s.includes.map(([t, d]) => <article key={t}><h3>{t}</h3><p>{d}</p></article>)}</div>
        </div></section>

        <section className="s-sec" style={{ paddingTop: 0 }}><div className="w">
          <div className="s-ex">
            <div><span className="tag">{s.name}</span><h2>{s.extra.title}</h2><p className="lead">{s.extra.text}</p></div>
            <ul>{s.extra.items.map(i => <li key={i}>{i}</li>)}</ul>
          </div>
        </div></section>

        <section className="s-sec" style={{ paddingTop: 0 }}><div className="w">
          <span className="tag">Paso a paso</span>
          <h2>Así lo <span className="ital">trabajamos</span></h2>
          <ol className="s-steps">{s.steps.map(([t, d], i) => <li key={t}><b>{i + 1}</b><h3>{t}</h3><p>{d}</p></li>)}</ol>
        </div></section>

        <section className="s-sec" style={{ paddingTop: '2rem' }}><div className="w">
          <span className="tag">Preguntas frecuentes</span>
          <h2>Lo que más <span className="ital">nos preguntan</span></h2>
          <div className="s-faq">{s.faqs.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
        </div></section>

        <section className="s-sec" style={{ paddingTop: 0 }}><div className="w">
          <div className="s-end">
            <span className="tag">¿Arrancamos?</span>
            <h2>Contanos qué <span className="ital">necesitás</span></h2>
            <p>Te respondemos en menos de 48 horas hábiles con una primera idea de cómo podemos ayudarte.</p>
            <div className="s-cta">
              <a className="s-btn" href={contact}>{s.cta} →</a>
              <a className="s-btn ghost" href={wa} target="_blank" rel="noopener noreferrer">WhatsApp</a>
            </div>
          </div>
        </div></section>

        <section className="s-sec" style={{ paddingTop: 0, paddingBottom: 0 }}><div className="w">
          <span className="tag">Seguí explorando</span>
          <h2>Otros <span className="ital">servicios</span></h2>
          <div className="s-more">
            {others.map(o => <a key={o.slug} href={`/servicios/${o.slug}`} className={`c-${o.color}`}><span className="n">{o.n}</span><h3>{o.name}</h3><span>Ver servicio →</span></a>)}
            <a href="/#servicios" className="all"><h3>Todos los servicios</h3><span>SEO, Google Ads, consultoría y más →</span></a>
          </div>
        </div></section>
      </main>

      <footer className="s-ft"><div className="w">
        <span>© {new Date().getFullYear()} EMUNÁ · Estudio creativo · Buenos Aires</span>
        <span><a href="/">Inicio</a> · <a href="/casos">Casos</a> · <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></span>
      </div></footer>
    </div>
  );
}
