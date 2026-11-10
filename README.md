# EMUNÁ — sitio con panel

## 1. Tu landing
Ya viene lista en `public/index.html`, con el formulario conectado y los enlaces a `/casos`. Antes de publicar, cambiá `CONFIG.whatsapp` y `CONFIG.email` al final de ese archivo por tus datos reales.

## 2. Supabase
1. Proyecto nuevo → SQL Editor → pegá y ejecutá `supabase/schema.sql`.
2. Authentication → Users → "Add user" con tu email y contraseña. Luego desactivá el registro público (signups) en los ajustes de Authentication.
3. Project Settings → API: copiá URL, anon key y service_role key.

## 3. Resend
Creá la API key. Para escribirle a tus clientes verificá tu dominio (registros DNS) y usá un remitente de ese dominio en `FROM_EMAIL`. Sin dominio verificado solo podés enviarte correos a vos misma.

## 4. Vercel
Subí esta carpeta a tu repo de GitHub, importalo en Vercel y cargá las variables de `.env.example`. `SUPABASE_SERVICE_ROLE_KEY` y `RESEND_API_KEY` nunca van al código. `ADMIN_EMAIL` debe ser el email de tu usuario de Supabase.

Panel: `/admin` · Casos públicos: `/casos`
