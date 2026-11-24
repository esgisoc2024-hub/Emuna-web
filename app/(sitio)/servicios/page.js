import Marco, { cabecera, cierre, contacto, AGENDA, WA } from '../Marco';
import { PILARES } from '../bloques';

export const metadata = { title: 'Servicios | EMUNÁ', description: 'Tráfico y pauta en Meta y Google, diseño y desarrollo web, y además branding, SEO y consultoría.' };

const HTML = `${cabecera('Servicios', 'Servicios <i>que traen consultas.</i>', 'Publicidad que trae gente y un sitio que la convierte en consultas. Funcionan mejor juntas, pero podés empezar por la que más te urge.')}
<section class="sec tight"><div class="w">${PILARES}</div></section>
<section class="sec" style="padding-top:0"><div class="w">
<h2>También sumamos, <i>cuando el proyecto lo pide.</i></h2>
<ul class="cmp">
<li><h3>Branding y contenidos</h3><p>Una identidad con personalidad y una voz propia, que se reconoce en cada lugar donde aparecés.</p><a href="/servicios/branding-contenidos">Conocé el servicio</a></li>
<li><h3>SEO y posicionamiento</h3><p>Trabajamos para que tu sitio aparezca en Google cuando tus clientes buscan lo que ofrecés, con contenido útil y mejoras técnicas que se sostienen en el tiempo.</p><a href="/contacto?servicio=SEO%20y%20posicionamiento">Consultanos</a></li>
<li><h3>Consultoría y auditorías</h3><p>Revisamos dónde estás hoy y te armamos un plan con las prioridades que más impacto tienen.</p><a href="/contacto?servicio=Consultor%C3%ADa%20y%20optimizaci%C3%B3n">Pedí una auditoría</a></li>
</ul>
</div></section>
${cierre()}`;

export default function Page() { return <Marco activo='servicios' html={HTML} />; }
