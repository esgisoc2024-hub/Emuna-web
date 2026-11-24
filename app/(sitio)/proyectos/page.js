import Marco, { cabecera, cierre, contacto, AGENDA, WA } from '../Marco';
import { ARROWS, DECK, TRABAJOS } from '../bloques';

export const metadata = { title: 'Proyectos | EMUNÁ', description: 'Desarrollos propios y proyectos de concepto de EMUNÁ: sitios, sistemas y campañas.' };

const HTML = `${cabecera('Proyectos', 'Proyectos <i>para mirar de cerca.</i>', 'Desarrollos propios y ejercicios de concepto: así pensamos una marca, su sitio y sus campañas.', ARROWS)}
<section class="sec tight" id="proyectos"><div class="w">${DECK}</div></section>
${TRABAJOS}
${cierre('¿El próximo proyecto <i>es el tuyo?</i>')}`;

export default function Page() { return <Marco activo='proyectos' html={HTML} />; }
