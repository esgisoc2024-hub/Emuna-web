// Propuestas cargadas como HTML propio. El HTML se muestra siempre dentro de un iframe
// aislado (sin acceso a la sesión ni a los datos del sitio), así un código pegado de afuera
// no puede tocar el panel ni la web.
export const MAX_HTML_BYTES = 2_900_000;
export const SANDBOX = 'allow-scripts allow-popups allow-popups-to-escape-sandbox allow-modals';

// Script que se suma al HTML para que el marco tome el alto justo y se pueda imprimir.
const HELPER = `<script>(function(){var l=0;function h(){var b=document.body,d=document.documentElement,v=Math.ceil(Math.max(d.scrollHeight,b?b.scrollHeight:0));if(Math.abs(v-l)>2){l=v;parent.postMessage({emunaH:v},'*')}}addEventListener('load',h);addEventListener('resize',h);try{new ResizeObserver(h).observe(document.documentElement)}catch(e){}setInterval(h,1200);addEventListener('message',function(e){if(e.data==='emuna-print')print()})})();</script>`;

export function wrapHtml(html) {
  let s = String(html || '');
  if (!/<html[\s>]/i.test(s)) {
    s = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body>${s}</body></html>`;
  } else if (!/<meta[^>]+charset/i.test(s)) {
    s = /<head[^>]*>/i.test(s) ? s.replace(/<head[^>]*>/i, m => `${m}<meta charset="utf-8">`) : s;
  }
  return /<\/body>/i.test(s) ? s.replace(/<\/body>(?![\s\S]*<\/body>)/i, `${HELPER}</body>`) : s + HELPER;
}

// Toma el <title> del HTML para sugerirlo como título de la propuesta
export const htmlTitle = html => (String(html || '').match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1] || '').trim();
