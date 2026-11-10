import { notFound } from 'next/navigation';
import { anon } from '@/lib/supabase';
export const revalidate = 60;
const embed = u => {
  if (!u) return null;
  const y = u.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/); if (y) return `https://www.youtube.com/embed/${y[1]}`;
  const v = u.match(/vimeo\.com\/(\d+)/); return v ? `https://player.vimeo.com/video/${v[1]}` : null;
};
export default async function Caso({ params }) {
  const { slug } = await params;
  const { data: c } = await anon().from('cases').select('*').eq('slug', slug).eq('published', true).single();
  if (!c) notFound();
  const video = embed(c.video_url);
  return (
    <main className="pub" style={{ maxWidth: 820 }}>
      <a href="/casos" className="back">← Todos los casos</a>
      <span className="eyebrow">{c.service}{c.client ? ` · ${c.client}` : ''}</span>
      <h1>{c.title}</h1>
      <p style={{ fontSize: '1.15rem', color: 'var(--muted)' }}>{c.summary}</p>
      <div className="case-media">
        {video && <iframe src={video} title={c.title} allowFullScreen loading="lazy" />}
        {(c.images || []).map(src => <img key={src} src={src} alt={c.title} loading="lazy" />)}
      </div>
      {c.results && <><h2 style={{ fontSize: '2rem', margin: '1rem 0' }}>Resultados</h2><p style={{ whiteSpace: 'pre-line' }}>{c.results}</p></>}
      {/^https?:\/\//.test(c.site_url || '') && <p style={{ marginTop: '2rem' }}><a className="btn" href={c.site_url} target="_blank" rel="noopener noreferrer">Visitar el sitio</a></p>}
    </main>
  );
}
