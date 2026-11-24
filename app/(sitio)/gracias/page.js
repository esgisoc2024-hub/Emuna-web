import Marco, { WA } from '../Marco';

// Página a la que llega cada persona después de enviar el formulario de contacto.
// No se indexa en Google: sirve para medir conversiones (Píxel de Meta, Google Analytics).
export const metadata = {
  title: 'Gracias por escribirnos | EMUNÁ',
  description: 'Recibimos tu consulta. Te respondemos en menos de 48 horas hábiles.',
  robots: { index: false, follow: false },
};

const BULB = '<svg viewBox="0 0 220 300" aria-hidden="true"><g stroke="#11140B" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M84 214C84 190 56 172 44 138 28 92 58 32 110 32s82 60 66 106c-12 34-40 52-40 76z" fill="#FFDD33"/><path d="M62 98C66 70 82 54 102 50" fill="none" stroke="#FFF6C2" stroke-width="7"/><rect x="82" y="214" width="56" height="16" rx="7" fill="#B7C78C"/><rect x="86" y="234" width="48" height="16" rx="7" fill="#B7C78C"/><path d="M96 256h28c0 10-7 16-14 16s-14-6-14-16z" fill="#6E7D4E"/></g></svg>';

const HTML = `
<section class="pg gr"><div class="w">
<h1>Gracias<span id="gnm"></span>. <i>Ya recibimos tu consulta.</i></h1>
<p class="lead">Te respondemos en menos de 48 horas hábiles. Te mandamos una confirmación por email: si no la ves, revisá la carpeta de spam.</p>
<div class="cta"><a href="${WA}" class="btn" target="_blank" rel="noopener">¿Es urgente? Escribinos por WhatsApp</a><a href="/proyectos" class="btn ghost">Mientras tanto, mirá nuestros proyectos</a></div>
<p class="idea">${BULB}<span>la idea ya está en marcha,<br>ahora le armamos el plan</span></p>
</div></section>
<section class="sec tight"><div class="w">
<h2>Qué pasa <i>ahora.</i></h2>
<ol class="vals gr-steps">
<li><h3>Leemos tu consulta</h3><p>Miramos lo que nos contaste y cómo está hoy tu negocio: tu web, tus redes y tus anuncios.</p></li>
<li><h3>Te escribimos</h3><p>Te contactamos por WhatsApp o por email para coordinar una charla corta y entender bien qué necesitás.</p></li>
<li><h3>Te mandamos la propuesta</h3><p>Una propuesta online con el alcance, los plazos y el precio cerrado. Sin costo y sin compromiso.</p></li>
</ol>
</div></section>`;

export default function Page() { return <Marco activo="contacto" html={HTML} />; }
