import Link from 'next/link';
import { anon } from '@/lib/supabase';
export const revalidate = 60;
export const metadata = { title: 'Casos de éxito · EMUNÁ' };
export default async function Casos() {
  const { data } = await anon().from('cases').select('slug,title,service,summary,images').eq('published', true).order('created_at', { ascending: false });
  return (
    <main className="pub">
      <a href="/" className="back">← Volver a EMUNÁ</a>
      <span className="eyebrow">Casos de éxito</span>
      <h1>Trabajo que habla por sí solo.</h1>
      <div className="grid">
        {(data || []).map(c => (
          <Link key={c.slug} href={`/casos/${c.slug}`} className="card">
            {c.images?.[0] && <img src={c.images[0]} alt={c.title} />}
            <small>{c.service}</small><h3>{c.title}</h3><p>{c.summary}</p>
            <span className="vp">Ver proyecto →</span>
          </Link>
        ))}
      </div>
      {!data?.length && <p>Estamos preparando los primeros casos. Mientras tanto, <a href="/#contacto" style={{ textDecoration: 'underline' }}>contanos tu proyecto</a>.</p>}
    </main>
  );
}
