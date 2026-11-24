// BORRADOR: esta carpeta empieza con _ y por eso Next.js no la publica.
// Para publicarla, completar los datos marcados con <mark class="tbd"> y mover la carpeta a app/(sitio)/.
import Marco, { cabecera } from '../../Marco';
import { CONTACT } from '@/lib/services';

export const metadata = { title: 'Política de privacidad | EMUNÁ', description: 'Cómo EMUNÁ trata los datos personales que nos dejás en el sitio.' };

// Los datos marcados con <mark class="tbd"> faltan completar antes de publicar.
const HTML = `${cabecera('Política de privacidad', 'Política <i>de privacidad.</i>')}
<section class="sec tight"><div class="w legal">
<p class="upd">Última actualización: noviembre de 2026.</p>
<p>En EMUNÁ cuidamos los datos que nos dejás. Esta política explica qué datos recibimos a través de este sitio, para qué los usamos, con quién los compartimos y cómo podés ejercer tus derechos, de acuerdo con la Ley 25.326 de Protección de los Datos Personales de la República Argentina.</p>

<h2>Quién es responsable de tus datos</h2>
<p>El responsable de la base de datos es <mark class="tbd">[nombre y apellido o razón social]</mark>, CUIT <mark class="tbd">[CUIT]</mark>, con domicilio en <mark class="tbd">[domicilio]</mark>, que opera bajo el nombre comercial EMUNÁ. Para cualquier consulta sobre tus datos escribinos a <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>.</p>

<h2>Qué datos recibimos</h2>
<ul>
<li><b>Formulario de contacto:</b> nombre, email, número de WhatsApp (opcional), el servicio que te interesa y el mensaje que nos escribís.</li>
<li><b>Propuestas comerciales:</b> si aceptás una propuesta desde su página, guardamos el nombre que indicás al aceptarla y la fecha.</li>
<li><b>WhatsApp, email e Instagram:</b> los datos que nos mandes por esos canales, que se rigen además por las políticas de cada plataforma.</li>
<li><b>Datos técnicos:</b> como cualquier sitio web, el servidor registra datos básicos de la conexión (por ejemplo, la dirección IP y el navegador) para funcionar y protegerse de abusos.</li>
</ul>
<p>No te pedimos datos sensibles y te pedimos que no los incluyas en tus mensajes.</p>

<h2>Para qué los usamos</h2>
<ul>
<li>Responder tu consulta y mandarte una confirmación por email.</li>
<li>Preparar y enviarte propuestas comerciales.</li>
<li>Gestionar el trabajo si contratás nuestros servicios.</li>
</ul>
<p>No vendemos ni alquilamos tus datos. No te vamos a sumar a listas de correo sin tu consentimiento.</p>

<h2>Con quién los compartimos</h2>
<p>Para que el sitio funcione usamos proveedores que tratan los datos por cuenta nuestra y solo para prestarnos su servicio:</p>
<ul>
<li><b>Vercel:</b> alojamiento del sitio.</li>
<li><b>Supabase:</b> base de datos donde se guardan las consultas y propuestas.</li>
<li><b>Resend:</b> envío de los emails de confirmación y avisos.</li>
<li><b>Meta y Google:</b> medición de visitas y de anuncios, si aceptás las cookies.</li>
<li><b>Google Fonts:</b> tipografías del sitio; tu navegador se conecta a los servidores de Google para descargarlas.</li>
</ul>
<p>Algunos de estos proveedores tienen servidores fuera de la Argentina. Al enviarnos tus datos, aceptás que se alojen en ellos.</p>

<h2>Cuánto tiempo los guardamos</h2>
<p>Guardamos los datos de tu consulta mientras dure la conversación o la relación comercial, y hasta dos años después del último contacto. Pasado ese plazo los eliminamos, salvo que la ley nos obligue a conservarlos.</p>

<h2>Cookies y medición</h2>
<p>Usamos herramientas de medición para saber cómo se usa el sitio y cómo funcionan nuestros anuncios:</p>
<ul>
<li><b>Píxel de Meta:</b> registra visitas y acciones en el sitio (por ejemplo, si enviaste el formulario) para medir y mejorar nuestros anuncios en Facebook e Instagram.</li>
<li><b>Google Analytics:</b> nos muestra de forma estadística cuántas personas visitan el sitio, desde dónde llegan y qué páginas miran.</li>
</ul>
<p>Estas herramientas usan cookies y se activan solo si las aceptás en el aviso que aparece al entrar al sitio. Podés cambiar tu elección cuando quieras desde el enlace "Preferencias de cookies" al pie de la página, o borrar las cookies desde la configuración de tu navegador.</p>
<p>Meta y Google tratan esos datos según sus propias políticas de privacidad.</p>

<h2>Tus derechos</h2>
<p>Podés pedirnos en cualquier momento acceder a tus datos, corregirlos, actualizarlos o eliminarlos, escribiendo a <a href="mailto:${CONTACT.email}">${CONTACT.email}</a>. Respondemos los pedidos de acceso dentro de los 10 días corridos y los de corrección o eliminación dentro de los 5 días hábiles.</p>
<p>El titular de los datos personales tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14, inciso 3 de la Ley N° 25.326. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la Ley N° 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.</p>

<h2>Seguridad</h2>
<p>Usamos conexiones cifradas y el acceso a la base de datos está limitado a las personas de EMUNÁ que lo necesitan para trabajar.</p>

<h2>Cambios en esta política</h2>
<p>Si cambiamos esta política, vamos a publicar la nueva versión en esta página con su fecha de actualización.</p>
</div></section>`;

export default function Page() { return <Marco activo="privacidad" html={HTML} />; }
