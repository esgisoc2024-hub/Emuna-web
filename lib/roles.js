// Roles de usuario y qué puede hacer cada uno.
// Por ahora solo los administradores pueden ingresar al panel.
export const ROLES = {
  admin: { label: 'Administrador', login: true, desc: 'Acceso total: clientes, propuestas, casos y usuarios.' },
  editor: { label: 'Editor', login: false, desc: 'Sin acceso al panel por ahora.' },
  lector: { label: 'Lector', login: false, desc: 'Sin acceso al panel por ahora.' },
};
export const canLogin = role => !!ROLES[role]?.login;
