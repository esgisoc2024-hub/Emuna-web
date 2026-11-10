import { notFound } from 'next/navigation';
import { admin } from '@/lib/supabase';
import ProposalDoc from '@/app/components/ProposalDoc';
import PrintButton from './PrintButton';
import '@/app/components/proposal.css';
export const dynamic = 'force-dynamic';

const get = async token => {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await admin().from('proposals').select('content,created_at,sent_at').eq('token', token).maybeSingle();
  return data?.content ? data : null;
};

export async function generateMetadata({ params }) {
  const d = await get((await params).token);
  return { title: d ? `${d.content.titulo} · Propuesta EMUNÁ` : 'Propuesta · EMUNÁ', robots: { index: false, follow: false } };
}

export default async function Propuesta({ params }) {
  const d = await get((await params).token);
  if (!d) notFound();
  return (
    <main className="pp">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link rel="stylesheet" precedence="default" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Caveat+Brush&family=Fraunces:ital,wght@1,400;1,600&display=swap" />
      <style>{`.pp{padding:2rem 4vw 4rem;background:#EDE6D6;min-height:100vh}.pp-bar{max-width:880px;margin:0 auto 1rem;display:flex;justify-content:flex-end}
.pp-btn{font:inherit;font-weight:700;background:#2C3320;color:#F7F3EA;border:0;border-radius:999px;padding:.7rem 1.3rem;cursor:pointer}.pp-btn:hover{background:#6E7D4E}
@media print{.pp{padding:0;background:#fff}.pp-bar{display:none}@page{margin:12mm}}`}</style>
      <div className="pp-bar"><PrintButton /></div>
      <ProposalDoc p={d.content} date={d.sent_at || d.created_at} />
    </main>
  );
}
