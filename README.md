# EMUNÁ — sitio con panel

## 1. Tu landing
Ya viene lista en `public/index.html`, con el formulario conectado y los enlaces a `/casos`. Antes de publicar, cambiá `CONFIG.whatsapp` y `CONFIG.email` al final de ese archivo por tus datos reales.

## 2. Supabase
1. Proyecto nuevo → SQL Editor → pegá y ejecutá `supabase/schema.sql`.
2. Ejecutá también `supabase/roles.sql` (roles y permisos: solo los administradores ingresan al panel).
3. Authentication → Users → "Add user" con tu email y contraseña. Luego desactivá el registro público (signups) en los ajustes de Authentication. Los usuarios nuevos se gestionan desde el panel, pestaña "Usuarios y permisos".
4. Project Settings → API: copiá URL, anon key y service_role key.

## 3. Resend
Creá la API key. Para escribirle a tus clientes verificá tu dominio (registros DNS) y usá un remitente de ese dominio en `FROM_EMAIL`. Sin dominio verificado solo podés enviarte correos a vos misma.

## 4. Vercel
Subí esta carpeta a tu repo de GitHub, importalo en Vercel y cargá las variables de `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` y `RESEND_API_KEY` nunca van al código. El acceso al panel ya no depende de `ADMIN_EMAIL`: lo define el rol de cada usuario en la tabla `user_roles`.

Panel: `/admin` · Casos públicos: `/casos`

## 5. Propuestas con Claude
1. Ejecutá `supabase/proposals_crm.sql` en Supabase.
2. En Vercel cargá `ANTHROPIC_API_KEY` (la creás en console.anthropic.com). Opcional: `ANTHROPIC_MODEL` para cambiar el modelo.
3. En el panel, pestaña "Propuestas (CRM)": escribile a Claude qué necesitás y arma la propuesta con el diseño de EMUNÁ. Cada propuesta tiene su página pública en `/propuesta/<código>` y un estado (borrador, enviada, en negociación, aceptada, rechazada).
