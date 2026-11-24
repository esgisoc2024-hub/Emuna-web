import Marco, { cabecera, cierre, contacto, AGENDA, WA } from '../Marco';
import { METODO, REPORTE } from '../bloques';

export const metadata = { title: 'Cómo trabajamos | EMUNÁ', description: 'Tus primeros 30 días con EMUNÁ y el reporte mensual que vas a recibir.' };

const HTML = `${cabecera('Cómo trabajamos', 'Cómo trabajamos <i>con vos.</i>', 'Un proceso simple, con fechas claras y números a la vista desde el primer mes.')}
<section class="sec tight" id="metodo"><div class="w">
<h2>Tus primeros 30 días, <i>sin sorpresas.</i></h2>
${METODO}
</div></section>
<section class="sec rp" id="reporte"><div class="w">${REPORTE}</div></section>
${cierre()}`;

export default function Page() { return <Marco activo='como-trabajamos' html={HTML} />; }
