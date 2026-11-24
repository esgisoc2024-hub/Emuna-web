import Marco, { cabecera, cierre, contacto, AGENDA, WA } from '../Marco';
import { FAQS } from '../bloques';

export const metadata = { title: 'Preguntas frecuentes | EMUNÁ', description: 'Lo que más nos consultan antes de trabajar juntos: precios, presupuesto de anuncios, plazos y más.' };

const HTML = `${cabecera('Preguntas', 'Preguntas <i>frecuentes.</i>', 'Respuestas cortas a lo que más nos consultan antes de arrancar. Si la tuya no está, escribinos.')}
<section class="sec fq solo tight" id="preguntas"><div class="w"><div>${FAQS.join('')}</div></div></section>
${cierre('¿Te quedó otra duda? <i>Escribinos.</i>')}`;

export default function Page() { return <Marco activo='preguntas' html={HTML} />; }
