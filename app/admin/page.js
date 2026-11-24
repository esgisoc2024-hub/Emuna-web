'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ROLES, canLogin } from '@/lib/roles';
import Proposals from './Proposals';
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const STATUS = ['nuevo', 'contactado', 'propuesta enviada', 'ganado', 'perdido'];
const slugify = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const F = ({ label, full, children }) => <label className={'l' + (full ? ' full' : '')}>{label}{children}</label>;

const ICONS = {
  clientes: 'M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 19v-1.5a3.5 3.5 0 0 0-2.5-3.3M15.5 4.2a3.5 3.5 0 0 1 0 6.6',
  propuestas: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h4',
  embudo: 'M3 4h18l-7 8.5V19l-4 2v-8.5z',
  casos: 'M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z',
  usuarios: 'M12 3l7 3v5c0 4.5-3 8.3-7 10-4-1.7-7-5.5-7-10V6zM9 12l2 2 4-4',
  sitio: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  salir: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h10',
  menu: 'M4 6h16M4 12h16M4 18h16',
};
const Icon = ({ name }) => <svg className="adm-ico" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={ICONS[name]} /></svg>;

function Login({ notice }) {
  const [err, setErr] = useState('');
  const go = async e => {
    e.preventDefault(); const f = new FormData(e.currentTarget);
    const { error } = await sb.auth.signInWithPassword({ email: f.get('email'), password: f.get('password') });
    if (error) setErr('Email o contraseña incorrectos.');
  };
  return (
    <div className="adm adm-login">
      <h1 style={{ marginBottom: '1.5rem' }}><img src="/logo-horizontal.svg" alt="EMUNÁ" width="164" height="48" style={{ display: 'block' }} /></h1>
      <form className="panel f" onSubmit={go} style={{ gridTemplateColumns: '1fr' }}>
        <F label="Email"><input name="email" type="email" required autoComplete="email" /></F>
        <F label="Contraseña"><input name="password" type="password" required autoComplete="current-password" /></F>
        {(err || notice) && <small style={{ color: '#B3402A' }}>{err || notice}</small>}
        <button className="btn">Entrar al panel</button>
      </form>
    </div>
  );
}

export default function Admin() {
  const [session, setSession] = useState(null), [ready, setReady] = useState(false), [tab, setTab] = useState('clientes'), [menu, setMenu] = useState(false);
  const [clients, setClients] = useState([]), [cases, setCases] = useState([]), [msg, setMsg] = useState('');
  const [role, setRole] = useState(null), [notice, setNotice] = useState(''), [users, setUsers] = useState([]);
  useEffect(() => {
    sb.auth.getSession().then(({ data }) => { setSession(data.session); if (!data.session) setReady(true); });
    const { data: l } = sb.auth.onAuthStateChange((_, s) => setSession(s));
    return () => l.subscription.unsubscribe();
  }, []);
  // Solo los roles habilitados (hoy, administradores) pueden quedarse logueados.
  useEffect(() => {
    if (!session) { setRole(null); return; }
    sb.from('user_roles').select('role').eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
      if (canLogin(data?.role)) { setRole(data.role); setNotice(''); setReady(true); }
      else { setNotice('Tu usuario no tiene permisos de administrador.'); sb.auth.signOut(); setReady(true); }
    });
  }, [session?.user?.id]);
  const load = async () => {
    const [a, c] = await Promise.all([
      sb.from('clients').select('*').order('created_at', { ascending: false }),
      sb.from('cases').select('*').order('created_at', { ascending: false })]);
    setClients(a.data || []); setCases(c.data || []);
  };
  const api = (path, opts = {}) => fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}`, ...(opts.headers || {}) } });
  const loadUsers = async () => { const r = await api('/api/users'); if (r.ok) setUsers(await r.json()); };
  useEffect(() => { if (session && role) { load(); loadUsers(); } }, [session, role]);
  const flash = t => { setMsg(t); setTimeout(() => setMsg(''), 4000); };
  if (!ready) return null;
  if (!session || !role) return <Login notice={notice} />;

  const addUser = async e => {
    const form = e.currentTarget; e.preventDefault(); flash('Creando usuario…');
    const r = await api('/api/users', { method: 'POST', body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    const j = await r.json(); if (!r.ok) return flash(j.error || 'No se pudo crear');
    form.reset(); flash('Usuario creado.'); loadUsers();
  };
  const setUserRole = async (id, r2) => {
    const r = await api('/api/users', { method: 'PATCH', body: JSON.stringify({ id, role: r2 }) });
    const j = await r.json(); flash(r.ok ? 'Rol actualizado.' : j.error || 'No se pudo cambiar'); loadUsers();
  };
  const delUser = async u => {
    if (!confirm(`¿Eliminar el usuario ${u.email}?`)) return;
    const r = await api('/api/users?id=' + u.id, { method: 'DELETE' });
    const j = await r.json(); flash(r.ok ? 'Usuario eliminado.' : j.error || 'No se pudo eliminar'); loadUsers();
  };

  const addClient = async e => {
    const form = e.currentTarget; e.preventDefault();
    const { error } = await sb.from('clients').insert(Object.fromEntries(new FormData(form)));
    if (error) return flash('No se pudo guardar el cliente.'); form.reset(); flash('Cliente guardado.'); load();
  };
  const setStatus = async (id, status) => { await sb.from('clients').update({ status }).eq('id', id); load(); };
  const delClient = async id => { if (confirm('¿Eliminar este cliente y sus propuestas?')) { await sb.from('clients').delete().eq('id', id); load(); } };


  const addCase = async e => {
    const form = e.currentTarget; e.preventDefault(); flash('Guardando…');
    const f = new FormData(form), title = f.get('title'), slug = slugify(title) + '-' + Date.now().toString(36);
    const images = [];
    for (const file of f.getAll('files')) {
      if (!file.size) continue;
      const path = `${slug}/${Date.now()}-${file.name.replace(/[^\w.-]/g, '_')}`;
      const { error } = await sb.storage.from('cases').upload(path, file);
      if (error) return flash('Error subiendo ' + file.name);
      images.push(sb.storage.from('cases').getPublicUrl(path).data.publicUrl);
    }
    const row = { slug, title, client: f.get('client'), service: f.get('service'), summary: f.get('summary'), results: f.get('results'), site_url: f.get('site_url'), video_url: f.get('video_url'), images, published: f.get('published') === 'on' };
    const { error } = await sb.from('cases').insert(row);
    if (error) return flash('No se pudo guardar el caso.'); form.reset(); flash('Caso guardado.'); load();
  };
  const togglePub = async c => { await sb.from('cases').update({ published: !c.published }).eq('id', c.id); load(); };
  const delCase = async id => { if (confirm('¿Eliminar este caso?')) { await sb.from('cases').delete().eq('id', id); load(); } };

  const NAV = [
    ['clientes', 'Clientes', clients.length],
    ['propuestas', 'Propuestas', null],
    ['embudo', 'Embudo', null],
    ['casos', 'Casos de éxito', cases.length],
    ['usuarios', 'Usuarios y permisos', null],
  ];
  const TITLES = {
    clientes: ['Clientes', 'Consultas del sitio y clientes que cargás a mano.'],
    propuestas: ['Propuestas', 'Armalas con Claude o pegá el HTML de una que ya tengas.'],
    embudo: ['Embudo de propuestas', 'Arrastrá cada propuesta a la etapa en la que está.'],
    casos: ['Casos de éxito', 'Lo que se publica en /casos.'],
    usuarios: ['Usuarios y permisos', 'Quién puede entrar al panel.'],
  };
  const go = k => { setTab(k); setMenu(false); window.scrollTo(0, 0); };
  const email = session.user.email || '';

  return (
    <div className={'adm adm-shell' + (menu ? ' menu-open' : '')}>
      <aside className="adm-side">
        <div className="adm-brand"><img src="/logo-horizontal.svg" alt="EMUNÁ" width="123" height="36" /><span>Panel</span></div>
        <nav className="adm-nav" aria-label="Secciones del panel">
          <p className="adm-navlabel">Gestión</p>
          {NAV.map(([k, n, c]) => <button key={k} className={tab === k ? 'on' : ''} aria-current={tab === k ? 'page' : undefined} onClick={() => go(k)}>
            <Icon name={k} /><span>{n}</span>{c != null && <b>{c}</b>}
          </button>)}
        </nav>
        <div className="adm-sidefoot">
          <a href="/" target="_blank" rel="noopener noreferrer"><Icon name="sitio" /><span>Ver sitio</span></a>
          <div className="adm-user">
            <span className="adm-avatar" aria-hidden="true">{email.slice(0, 1).toUpperCase()}</span>
            <span className="adm-email" title={email}>{email}<small>{ROLES[role]?.label}</small></span>
            <button onClick={() => sb.auth.signOut()} title="Salir" aria-label="Salir"><Icon name="salir" /></button>
          </div>
        </div>
      </aside>
      <div className="adm-scrim" onClick={() => setMenu(false)} />
      <main className="adm-main">
        <div className="adm-top">
          <button className="adm-burger" onClick={() => setMenu(true)} aria-label="Abrir menú"><Icon name="menu" /></button>
          <div><h1>{TITLES[tab][0]}</h1><p>{TITLES[tab][1]}</p></div>
        </div>

      {tab === 'clientes' && <>
        <form className="panel f" onSubmit={addClient}>
          <h3 className="full">Nuevo cliente</h3>
          <F label="Nombre"><input name="name" required /></F><F label="Email"><input name="email" type="email" /></F>
          <F label="Teléfono"><input name="phone" /></F><F label="Empresa"><input name="company" /></F>
          <F label="Notas" full><textarea name="notes" style={{ minHeight: 60 }} /></F>
          <button className="btn full">Guardar cliente</button>
        </form>
        <div className="panel"><h3>Clientes y consultas ({clients.length})</h3>
          {clients.map(c => <div className="row" key={c.id}>
            <div><strong>{c.name}</strong> <small>{c.company}</small><br /><small>{c.email} {c.phone} · {c.service || 'sin área'} · {c.source}</small>{c.notes && <><br /><small>{c.notes.slice(0, 140)}</small></>}</div>
            <div><select value={c.status} onChange={e => setStatus(c.id, e.target.value)}>{STATUS.map(s => <option key={s}>{s}</option>)}</select> <button className="btn ghost sm" onClick={() => delClient(c.id)}>Eliminar</button></div>
          </div>)}
          {!clients.length && <p>Todavía no hay clientes. Las consultas del formulario aparecen acá.</p>}
        </div>
      </>}

      {(tab === 'propuestas' || tab === 'embudo') && <Proposals key={tab} view={tab === 'embudo' ? 'embudo' : 'lista'} sb={sb} api={api} clients={clients} flash={flash} onClientsChange={load} />}

      {tab === 'casos' && <>
        <form className="panel f" onSubmit={addCase}>
          <h3 className="full">Nuevo caso</h3>
          <F label="Título"><input name="title" required /></F><F label="Cliente"><input name="client" /></F>
          <F label="Servicio"><input name="service" placeholder="Diseño web, Paid media…" /></F><F label="Enlace al sitio"><input name="site_url" type="url" placeholder="https://" /></F>
          <F label="Enlace de video (YouTube o Vimeo)" full><input name="video_url" type="url" /></F>
          <F label="Resumen" full><textarea name="summary" style={{ minHeight: 70 }} /></F>
          <F label="Resultados" full><textarea name="results" style={{ minHeight: 70 }} /></F>
          <F label="Fotos (la primera es la portada)" full><input name="files" type="file" accept="image/*" multiple /></F>
          <label className="l"><span><input type="checkbox" name="published" /> Publicar ahora</span></label>
          <button className="btn full">Guardar caso</button>
        </form>
        <div className="panel"><h3>Casos ({cases.length})</h3>
          {cases.map(c => <div className="row" key={c.id}><div><strong>{c.title}</strong> <small>{c.client}</small><br /><small>{c.published ? 'Publicado' : 'Borrador'} · {c.images?.length || 0} fotos</small></div>
            <div><button className="btn ghost sm" onClick={() => togglePub(c)}>{c.published ? 'Despublicar' : 'Publicar'}</button> <button className="btn ghost sm" onClick={() => delCase(c.id)}>Eliminar</button></div></div>)}
          {!cases.length && <p>Cargá tu primer caso con enlace, fotos y video.</p>}
        </div>
      </>}
      {tab === 'usuarios' && <>
        <form className="panel f" onSubmit={addUser}>
          <h3 className="full">Nuevo usuario</h3>
          <F label="Email"><input name="email" type="email" required autoComplete="off" /></F>
          <F label="Contraseña (mínimo 8 caracteres)"><input name="password" type="password" minLength={8} required autoComplete="new-password" /></F>
          <F label="Rol" full><select name="role" defaultValue="admin">{Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</select></F>
          <button className="btn full">Crear usuario</button>
        </form>
        <div className="panel"><h3>Usuarios ({users.length})</h3>
          {users.map(u => <div className="row" key={u.id}>
            <div><strong>{u.email}</strong>{u.id === session.user.id && <small> (vos)</small>}<br />
              <small>{ROLES[u.role]?.label} · {canLogin(u.role) ? 'Puede ingresar al panel' : 'Sin acceso al panel'} · {u.last_sign_in_at ? 'Último ingreso ' + new Date(u.last_sign_in_at).toLocaleDateString('es-AR') : 'Nunca ingresó'}</small></div>
            <div><select value={u.role} disabled={u.id === session.user.id} onChange={e => setUserRole(u.id, e.target.value)}>{Object.entries(ROLES).map(([k, r]) => <option key={k} value={k}>{r.label}</option>)}</select>{' '}
              {u.id !== session.user.id && <button className="btn ghost sm" onClick={() => delUser(u)}>Eliminar</button>}</div>
          </div>)}
        </div>
        <div className="panel"><h3>Qué puede hacer cada rol</h3>
          {Object.values(ROLES).map(r => <p key={r.label} style={{ marginBottom: '.4rem' }}><strong>{r.label}:</strong> {r.desc}</p>)}
        </div>
      </>}
      </main>
      {msg && <div className="toast" role="status">{msg}</div>}
    </div>
  );
}
