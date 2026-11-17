import Link from 'next/link';
import { anon } from '@/lib/supabase';
export const revalidate = 60;
export const metadata = { title: 'Casos · EMUNÁ' };
export default async function Casos() {
  const { data } = await anon().from('cases').select('slug,title,service,summary,images').eq('published', true).order('created_at', { ascending: false });
  return (
    <main className="pub">
      <div className="pub-fog" aria-hidden="true" />
      <header className="pub-hd"><a href="/" aria-label="EMUNÁ, inicio"><img src="/logo-horizontal-claro.svg" alt="EMUNÁ" width="143" height="42" /></a><a href="/" className="back">Volver al inicio</a></header>
      <h1>Casos <i>con nombre y apellido.</i></h1>
      <div className="grid">
        {(data || []).map(c => (
          <Link key={c.slug} href={`/casos/${c.slug}`} className="card">
            {c.images?.[0] && <img src={c.images[0]} alt={c.title} />}
            <small>{c.service}</small><h3>{c.title}</h3><p>{c.summary}</p>
            <span className="vp">Ver proyecto</span>
          </Link>
        ))}
      </div>
      {!data?.length && <p className="pub-empty">Estamos preparando los primeros casos. Mientras tanto, podés ver nuestros <a href="/#proyectos">proyectos</a> o <a href="/#contacto">contarnos el tuyo</a>.</p>}
    </main>
  );
}
