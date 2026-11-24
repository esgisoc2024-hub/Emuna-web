import Marco, { cabecera, cierre, contacto, AGENDA, WA } from './Marco';
import { HERO, PROBLEMA, PILARES, ALSO, ARROWS, DECK, METODO, FOTO, NOSOTROS_P1, FAQS } from './bloques';

export const metadata = { title: 'EMUNÁ | Publicidad digital y diseño web en Buenos Aires', description: 'Estudio boutique de Buenos Aires. Gestionamos tu publicidad en Meta y Google y diseñamos tu sitio web para que la inversión vuelva en ventas.' };

const HTML = `${HERO}
${PROBLEMA}
<section class="sec" id="servicios" style="padding-top:0"><div class="w">
<h2>Hacemos dos cosas. <i>Las hacemos a fondo.</i></h2>
<p class="lead">Publicidad que trae gente y un sitio que la convierte en consultas. Funcionan mejor juntas, pero podés empezar por la que más te urge.</p>
${PILARES}${ALSO}
</div></section>
<section class="sec" id="proyectos"><div class="w">
<div class="pr-top"><div><h2>Proyectos <i>para mirar de cerca.</i></h2><p class="lead">Desarrollos propios y ejercicios de concepto: así pensamos una marca, su sitio y sus campañas.</p></div>${ARROWS}</div>
${DECK}
<a href="/proyectos" class="btn ghost more">Ver todos los proyectos</a>
</div></section>
<section class="sec" id="metodo"><div class="w">
<h2>Tus primeros 30 días, <i>sin sorpresas.</i></h2>
${METODO}
<a href="/como-trabajamos" class="btn ghost more">Ver cómo trabajamos</a>
</div></section>
<section class="sec fd" id="equipo"><div class="w">
${FOTO}
<div>
<h2>Un estudio de dos. <i>Hablás con quien hace el trabajo.</i></h2>
${NOSOTROS_P1}
<div class="cta"><a href="/nosotros" class="btn">Conocenos</a><a ${AGENDA} class="btn ghost">Agendar una reunión</a></div>
</div>
</div></section>
<section class="sec fq" id="preguntas"><div class="w">
<h2>Antes de escribirnos, <i>lo que seguro te preguntás.</i></h2>
<div>${FAQS.slice(0, 3).join('')}<a href="/preguntas" class="btn ghost more">Ver todas las preguntas</a></div>
</div></section>
${contacto()}`;

export default function Page() { return <Marco activo='inicio' html={HTML} />; }
