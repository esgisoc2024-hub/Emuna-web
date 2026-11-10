// Estados del CRM de propuestas y utilidades compartidas
export const STATUSES = [
  { k: 'borrador', label: 'Borrador', color: '#D8E0C7' },
  { k: 'enviada', label: 'Enviada', color: '#F0C48C' },
  { k: 'en_negociacion', label: 'En negociación', color: '#E7B86A' },
  { k: 'aceptada', label: 'Aceptada', color: '#6E7D4E', dark: true },
  { k: 'rechazada', label: 'Rechazada', color: '#C9C2B2' },
];
export const statusLabel = k => STATUSES.find(s => s.k === k)?.label || k;

export const money = (n, cur = 'ARS') =>
  n == null || n === '' || isNaN(Number(n)) ? 'A definir'
    : new Intl.NumberFormat('es-AR', { style: 'currency', currency: cur === 'USD' ? 'USD' : 'ARS', maximumFractionDigits: 0 }).format(Number(n));

// Totales separados entre pagos únicos y mensuales
export function totals(inv) {
  const items = inv?.items || [];
  const sum = per => items.filter(i => (i.periodicidad || 'unico') === per && typeof i.monto === 'number').reduce((a, i) => a + i.monto, 0);
  return { unico: sum('unico'), mensual: sum('mensual'), pending: items.some(i => typeof i.monto !== 'number'), hasMensual: items.some(i => i.periodicidad === 'mensual'), hasUnico: items.some(i => (i.periodicidad || 'unico') === 'unico') };
}

// Formato fijo que Claude tiene que completar: así todas las propuestas se ven iguales
const str = d => ({ type: 'string', description: d });
const list = (d, items = { type: 'string' }) => ({ type: 'array', description: d, items });
export const PROPOSAL_TOOL = {
  name: 'guardar_propuesta',
  description: 'Guarda la versión completa y actualizada de la propuesta comercial y responde en el chat.',
  input_schema: {
    type: 'object',
    properties: {
      mensaje: str('Respuesta corta para el equipo de EMUNÁ en el chat: qué armaste o cambiaste y qué datos faltan o conviene confirmar. Máximo 4 oraciones.'),
      cliente_id: { type: ['string', 'null'], description: 'id del cliente del CRM al que corresponde la propuesta, si coincide con alguno de la lista. Si no, null.' },
      propuesta: {
        type: 'object',
        properties: {
          titulo: str('Título corto y concreto del proyecto, por ejemplo "Nueva web y tienda online para Café Bruma".'),
          cliente: { type: 'object', properties: { nombre: str('Nombre de la persona'), empresa: str('Marca o empresa'), email: str('Email si se conoce, si no vacío') }, required: ['nombre', 'empresa', 'email'] },
          introduccion: str('Párrafo de apertura, cálido y directo, que muestre que entendimos su situación. 2 a 4 oraciones.'),
          objetivos: list('Entre 2 y 5 objetivos concretos del proyecto.'),
          servicios: list('Qué vamos a hacer, agrupado por servicio.', {
            type: 'object',
            properties: { nombre: str('Nombre del servicio'), descripcion: str('Una o dos oraciones'), entregables: list('Entregables concretos') },
            required: ['nombre', 'descripcion', 'entregables'],
          }),
          etapas: list('Etapas del trabajo en orden.', {
            type: 'object',
            properties: { nombre: str('Nombre de la etapa'), duracion: str('Duración estimada, por ejemplo "1 semana". Vacío si no se sabe.'), descripcion: str('Qué pasa en esta etapa') },
            required: ['nombre', 'duracion', 'descripcion'],
          }),
          inversion: {
            type: 'object',
            properties: {
              moneda: { type: 'string', enum: ['ARS', 'USD'] },
              items: list('Conceptos de la inversión.', {
                type: 'object',
                properties: {
                  concepto: str('Concepto'), detalle: str('Aclaración breve, puede quedar vacía'),
                  monto: { type: ['number', 'null'], description: 'Monto numérico sin símbolos. null si el equipo no lo indicó: nunca inventes precios.' },
                  periodicidad: { type: 'string', enum: ['unico', 'mensual'] },
                },
                required: ['concepto', 'detalle', 'monto', 'periodicidad'],
              }),
              forma_de_pago: str('Forma de pago si se indicó; si no, vacío.'),
              nota: str('Aclaración opcional, por ejemplo que la inversión en anuncios se paga aparte. Vacío si no aplica.'),
            },
            required: ['moneda', 'items', 'forma_de_pago', 'nota'],
          },
          condiciones: list('Condiciones relevantes, sin letra chica innecesaria. Puede quedar vacía.'),
          validez_dias: { type: 'integer', description: 'Días de validez de la propuesta (15 si no se indicó).' },
          proximos_pasos: list('2 a 4 pasos para avanzar.'),
        },
        required: ['titulo', 'cliente', 'introduccion', 'objetivos', 'servicios', 'etapas', 'inversion', 'condiciones', 'validez_dias', 'proximos_pasos'],
      },
    },
    required: ['mensaje', 'cliente_id', 'propuesta'],
  },
};
