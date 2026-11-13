import { admin } from '@/lib/supabase';
import { SANDBOX, wrapHtml } from '@/lib/htmlProposal';
export const dynamic = 'force-dynamic';

// Sirve el HTML de una propuesta cargada a mano, aislado del resto del sitio.
export async function GET(_req, { params }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token)) return new Response('No encontrado', { status: 404 });
  const { data } = await admin().from('proposals').select('html').eq('token', token).maybeSingle();
  if (!data?.html) return new Response('No encontrado', { status: 404 });
  return new Response(wrapHtml(data.html), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Security-Policy': `sandbox ${SANDBOX}`,
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store',
      'Referrer-Policy': 'no-referrer',
    },
  });
}
