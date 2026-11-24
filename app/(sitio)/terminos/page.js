import Marco, { cabecera } from '../Marco';
import { CONTACT } from '@/lib/services';

export const metadata = { title: 'Términos y condiciones | EMUNÁ', description: 'Condiciones de uso del sitio de EMUNÁ.' };

// Los datos marcados con <mark class="tbd"> faltan completar antes de publicar.
const HTML = `${cabecera('Términos y condiciones', 'Términos <i>y condiciones.</i>')}
<section class="sec tight"><div class="w legal">
<p class="upd">Última actualización: noviembre de 2026.</p>
<p>Estos términos regulan el uso de este sitio, operado por <mark class="tbd">[nombre y apellido o razón social]</mark>, CUIT <mark class="tbd">[CUIT]</mark>, bajo el nombre comercial EMUNÁ. Al navegarlo aceptás estas condiciones.</p>

<h2>Qué es este sitio</h2>
<p>Es el sitio de presentación de EMUNÁ, un estudio de publicidad digital y diseño web. La información sobre servicios, procesos y plazos es orientativa y no constituye una oferta vinculante.</p>

<h2>Propuestas y contrataciones</h2>
<p>Cada trabajo se rige por la propuesta comercial que te enviamos, con su alcance, precio, plazos y condiciones. Si algo de esa propuesta difiere de estos términos, vale lo que dice la propuesta. La inversión en publicidad se paga aparte, directamente a cada plataforma.</p>

<h2>Proyectos de concepto y ejemplos</h2>
<p>Algunos proyectos del sitio están identificados como proyectos de concepto: son ejercicios propios para mostrar cómo trabajamos y no corresponden a clientes reales. Los números del reporte de ejemplo son ilustrativos y no garantizan resultados. Las fotos de ilustración provienen de Unsplash.</p>

<h2>Propiedad intelectual</h2>
<p>Los textos, el diseño, el logo y el código de este sitio pertenecen a EMUNÁ. No se pueden copiar ni usar con fines comerciales sin autorización por escrito.</p>

<h2>Enlaces a otros sitios</h2>
<p>El sitio incluye enlaces a WhatsApp, Instagram y otros servicios. No somos responsables por el contenido ni por las políticas de esos sitios.</p>

<h2>Responsabilidad</h2>
<p>Hacemos lo posible para que el sitio funcione siempre y su información esté actualizada, pero no garantizamos que esté libre de errores o interrupciones.</p>

<h2>Datos personales</h2>
<p>El uso de los datos que nos dejás se explica en nuestra <a href="/privacidad">política de privacidad</a>.</p>

<h2>Ley aplicable</h2>
<p>Estos términos se rigen por las leyes de la República Argentina. Ante cualquier conflicto serán competentes los tribunales ordinarios de <mark class="tbd">[ciudad]</mark>, sin perjuicio de los derechos que la Ley 24.240 de Defensa del Consumidor te reconoce.</p>

<h2>Contacto</h2>
<p>Para cualquier consulta sobre estos términos escribinos a <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>.</p>
</div></section>`;

export default function Page() { return <Marco activo="terminos" html={HTML} />; }
