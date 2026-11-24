import { CONTACT } from '@/lib/services';
import Marco, { cabecera, cierre, contacto, AGENDA, WA } from '../Marco';
import { FOTO, NOSOTROS_P1, NOSOTROS_P2 } from '../bloques';

export const metadata = { title: 'Nosotros | EMUNÁ', description: 'Gise y Esteban, fundadores de EMUNÁ: un estudio boutique de publicidad digital y diseño web en Buenos Aires.' };

const HTML = `${cabecera('Nosotros', 'Un estudio de dos. <i>Hablás con quien hace el trabajo.</i>')}
<section class="sec fd tight" id="equipo"><div class="w">
${FOTO}
<div>
${NOSOTROS_P1}
${NOSOTROS_P2}
<div class="cta"><a ${AGENDA} class="btn">Agendar una reunión</a><a href="${CONTACT.instagram}" class="btn ghost" target="_blank" rel="noopener">Seguinos en Instagram</a></div>
</div>
</div></section>
<section class="sec" style="padding-top:0"><div class="w">
<h2>Cómo nos gusta <i>trabajar.</i></h2>
<ul class="vals">
<li><h3>Pocos clientes</h3><p>Tomamos los proyectos que podemos atender bien, para que cada cliente tenga tiempo y dedicación de verdad.</p></li>
<li><h3>Números a la vista</h3><p>Cada mes ves qué funcionó, cuánto costó cada consulta y qué proponemos para el mes siguiente.</p></li>
<li><h3>Sin intermediarios</h3><p>Hablás directo con nosotros dos, que somos quienes hacemos el trabajo, de la primera charla al reporte.</p></li>
</ul>
</div></section>
${cierre()}`;

export default function Page() { return <Marco activo='nosotros' html={HTML} />; }
