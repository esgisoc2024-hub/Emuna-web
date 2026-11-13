import { notFound } from 'next/navigation';
import { admin } from '@/lib/supabase';
import ProposalDoc from '@/app/components/ProposalDoc';
import HtmlFrame from '@/app/components/HtmlFrame';
import PrintButton from './PrintButton';
import AcceptBox from './AcceptBox';
import { CONTACT } from '@/lib/services';
import '@/app/components/proposal.css';
export const dynamic = 'force-dynamic';

const get = async token => {
  if (!/^[0-9a-f-]{36}$/i.test(token)) return null;
  const { data } = await admin().from('proposals').select('content,html,title,created_at,sent_at,status,accepted_at').eq('token', token).maybeSingle();
  return data?.content || data?.html ? data : null;
};

export async function generateMetadata({ params }) {
  const d = await get((await params).token);
  return { title: d ? `${d.content?.titulo || d.title || 'Propuesta'} · Propuesta EMUNÁ` : 'Propuesta · EMUNÁ', robots: { index: false, follow: false } };
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
.pa{max-width:880px;margin:1.5rem auto 0;background:#2C3320;color:#F7F3EA;border-radius:28px;padding:clamp(1.6rem,5vw,2.6rem);text-align:center;font-family:"Bricolage Grotesque",system-ui,sans-serif}
.pa h2{font-weight:800;letter-spacing:-.02em;font-size:clamp(1.5rem,3.6vw,2.2rem);line-height:1.1;margin:.3rem 0 1.2rem}
.pa-tag{font-family:"Caveat Brush",cursive;font-size:1.7rem;color:#F0C48C;display:inline-block;transform:rotate(-2deg)}
.pa-ok{background:#6E7D4E}.pa-ok p{max-width:34rem;margin:0 auto;opacity:.95}
.pa-row{display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap}
.pa-btn{font:inherit;font-weight:700;background:#F0C48C;color:#2C3320;border:2px solid #F0C48C;border-radius:999px;padding:.85rem 1.5rem;cursor:pointer;text-decoration:none;transition:transform .3s}
.pa-btn:hover{transform:translateY(-2px)}.pa-btn:disabled{opacity:.6}
.pa-btn.ghost{background:transparent;color:#F7F3EA;border-color:rgba(247,243,234,.45)}
.pa-form{display:flex;flex-direction:column;gap:1rem;align-items:center}
.pa-form label{display:flex;flex-direction:column;gap:.3rem;text-align:left;font-size:.9rem;width:min(100%,360px)}
.pa-form input{font:inherit;padding:.75rem 1rem;border-radius:14px;border:0;background:#F7F3EA;color:#2C3320}
.pa-err{color:#F0C48C;font-size:.9rem;margin:0}
.pp-html{max-width:1100px;margin:0 auto;border-radius:20px;overflow:hidden;box-shadow:0 10px 40px rgba(44,51,32,.12);background:#fff}
@media print{.pp{padding:0;background:#fff}.pp-bar,.pa{display:none}@page{margin:12mm}}`}</style>
      <div className="pp-bar"><PrintButton frame={!d.content} /></div>
      {d.content ? <ProposalDoc p={d.content} date={d.sent_at || d.created_at} />
        : <div className="pp-html"><HtmlFrame src={`/propuesta/${(await params).token}/raw`} /></div>}
      <AcceptBox token={(await params).token} status={d.status} acceptedAt={d.accepted_at} whatsapp={CONTACT.whatsapp} title={d.content?.titulo || d.title || 'la propuesta'} />
    </main>
  );
}
