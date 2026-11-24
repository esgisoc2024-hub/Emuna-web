import Marco, { cabecera, cierre, contacto, AGENDA, WA } from '../Marco';

export const metadata = { title: 'Contacto | EMUNÁ', description: 'Contanos qué necesitás y cómo está hoy tu negocio. Te respondemos en menos de 48 horas hábiles.' };

const HTML = `<section class="pg"><div class="w"><p class="crumb"><a href="/">Inicio</a> / Contacto</p></div></section>
${contacto().replace('<section class="sec ct" id="contacto" style="padding-bottom:0">', '<section class="sec ct" id="contacto" style="padding:1.5rem 0 0">').replace('<h2>Hablemos de <i>tu próximo paso.</i></h2>', '<h1>Hablemos de <i>tu próximo paso.</i></h1>')}`;

export default function Page() { return <Marco activo='contacto' html={HTML} />; }
