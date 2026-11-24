import Script from 'next/script';
import { CONTACT } from '@/lib/services';
import { CONTACTO_RAW } from './bloques';

// Encabezado, menú y pie únicos para todo el sitio público: un cambio acá se ve en todas las páginas.
export const NAV = [
  ['servicios', '/servicios', 'Servicios'],
  ['proyectos', '/proyectos', 'Proyectos'],
  ['como-trabajamos', '/como-trabajamos', 'Cómo trabajamos'],
  ['nosotros', '/nosotros', 'Nosotros'],
  ['preguntas', '/preguntas', 'Preguntas'],
];

export const WA = `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent('Hola EMUNÁ, quiero hablar sobre un proyecto.')}`;
export const MAIL = `mailto:${CONTACT.email}?subject=${encodeURIComponent('Consulta desde el sitio')}`;
const EXT = 'target="_blank" rel="noopener"';
export const AGENDA = CONTACT.agenda ? `href="${CONTACT.agenda}" ${EXT}` : 'href="/contacto"';

const WA_ICON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.6-1.2.1-.2 0-.3 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4 5.4 5.4 0 0 0 2.6.9 2.2 2.2 0 0 0 1.5-1.1 1.9 1.9 0 0 0 .1-1.1c0-.1-.2-.2-.4-.3z"/></svg>';

const encabezado = activo => `
<header id="hd"><div class="w nav">
<a href="/" class="logo" aria-label="EMUNÁ, inicio"><img src="/logo-horizontal-claro.svg" alt="EMUNÁ" width="143" height="42"></a>
<nav class="lks" aria-label="Principal">${NAV.map(([k, h, t]) => `<a href="${h}"${k === activo ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
<div class="hr"><a href="${WA}" class="ic" ${EXT} aria-label="Escribir por WhatsApp">${WA_ICON}</a><a ${AGENDA} class="btn sm">Agendar reunión</a><button class="burger" id="bg" aria-expanded="false" aria-controls="mn">Menú</button></div>
</div></header>
<div class="mn" id="mn" aria-hidden="true"><div class="w"><nav aria-label="Menú">
<a href="/admin" class="pnl" id="pnl" hidden>Ir al panel de administración</a>
<a href="/">Inicio</a>${NAV.map(([, h, t]) => `<a href="${h}">${t}</a>`).join('')}<a href="/contacto">Contacto</a>
</nav><aside><p>Buenos Aires, Argentina</p><a href="${MAIL}">Escribinos por email</a><a href="${WA}" ${EXT}>Escribinos por WhatsApp</a><a href="${CONTACT.instagram}" ${EXT}>Instagram</a></aside></div></div>`;

const pie = () => `
<footer><div class="w fg"><div><img src="/logo-horizontal-claro.svg" alt="EMUNÁ" width="170" height="50"><p>Estudio boutique de publicidad digital y diseño web en Buenos Aires.</p></div>
<div><h4>Servicios</h4><a href="/servicios/marketing-paid-media">Tráfico y pauta</a><a href="/servicios/diseno-desarrollo-web">Diseño y desarrollo web</a><a href="/servicios/branding-contenidos">Branding y contenidos</a><a href="/servicios">Todos los servicios</a></div>
<div><h4>Estudio</h4><a href="/proyectos">Proyectos</a><a href="/casos">Casos</a><a href="/como-trabajamos">Cómo trabajamos</a><a href="/nosotros">Nosotros</a><a href="/preguntas">Preguntas</a></div>
<div><h4>Contacto</h4><a href="/contacto">Formulario</a><a href="${MAIL}">Email</a><a href="${WA}" ${EXT}>WhatsApp</a><a href="${CONTACT.instagram}" ${EXT}>Instagram</a></div>
<div><h4>Legal</h4><a href="/privacidad">Política de privacidad</a><a href="/terminos">Términos y condiciones</a></div></div>
<div class="w fb"><span>© ${new Date().getFullYear()} EMUNÁ, Buenos Aires</span><span>Fotos de ilustración: Unsplash. <a href="/admin" style="opacity:.7">Acceso</a></span></div></footer>
<a href="${WA}" class="wa-f" ${EXT} aria-label="Escribir por WhatsApp">${WA_ICON}</a>`;

// Bloques que se repiten entre páginas
export const contacto = () => CONTACTO_RAW
  .replace('<a href="#" class="btn" id="wa" target="_blank" rel="noopener">', `<a href="${WA}" class="btn" ${EXT}>`)
  .replace('<a href="#" class="btn ghost" id="ml">', `<a href="${MAIL}" class="btn ghost">`);

export const cabecera = (miga, titulo, bajada = '', extra = '') => `
<section class="pg"><div class="w">
<p class="crumb"><a href="/">Inicio</a> / ${miga}</p>
${extra ? `<div class="pr-top"><div><h1>${titulo}</h1>${bajada ? `<p class="lead">${bajada}</p>` : ''}</div>${extra}</div>` : `<h1>${titulo}</h1>${bajada ? `<p class="lead">${bajada}</p>` : ''}`}
</div></section>`;

export const cierre = (titulo = '¿Arrancamos? <i>Contanos qué necesitás.</i>') => `
<section class="sec"><div class="w"><div class="band"><h2>${titulo}</h2>
<div class="cta"><a ${AGENDA} class="btn">Agendar reunión</a><a href="${WA}" class="btn ghost" ${EXT}>Escribinos por WhatsApp</a></div></div></div></section>`;

export default function Marco({ activo, html, children }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.classList.add("js")' }} />
      <div className="fog" aria-hidden="true" />
      <div className="grain" aria-hidden="true" />
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: encabezado(activo) }} />
      {html ? <main dangerouslySetInnerHTML={{ __html: html }} /> : <main>{children}</main>}
      <div style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: pie() }} />
      <Script src="/sitio.js" strategy="afterInteractive" />
    </>
  );
}
