import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export const runtime = "nodejs";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);
const esc = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function POST(req) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Solicitud inválida" }, { status: 400 });
  }

  // Campo trampa para bots: si viene completo, fingimos éxito y no guardamos nada.
  if (body.website) return NextResponse.json({ ok: true });

  const lead = {
    name: clean(body.name, 120),
    email: clean(body.email, 160).toLowerCase(),
    company: clean(body.company, 160) || null,
    service: clean(body.service, 80),
    message: clean(body.message, 4000),
  };

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(lead.email);
  if (lead.name.length < 2 || !emailOk || !lead.service || lead.message.length < 15) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }

  // 1) Guardar el contacto
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });
  const { error: dbError } = await supabase.from("leads").insert(lead);
  if (dbError) {
    console.error("Error guardando lead:", dbError);
    return NextResponse.json({ error: "No se pudo guardar" }, { status: 500 });
  }

  // 2) Avisarte por correo (si falla, el contacto ya quedó guardado)
  if (process.env.RESEND_API_KEY && process.env.NOTIFY_TO && process.env.MAIL_FROM) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { error: mailError } = await resend.emails.send({
        from: process.env.MAIL_FROM,
        to: process.env.NOTIFY_TO,
        replyTo: lead.email,
        subject: `Nuevo contacto: ${lead.name}`,
        html: `<h2>Nuevo contacto desde el sitio</h2>
          <p><b>Nombre:</b> ${esc(lead.name)}<br>
          <b>Email:</b> ${esc(lead.email)}<br>
          <b>Empresa:</b> ${esc(lead.company || "-")}<br>
          <b>Área:</b> ${esc(lead.service)}</p>
          <p>${esc(lead.message).replace(/\n/g, "<br>")}</p>`,
      });
      if (mailError) console.error("Error enviando correo:", mailError);
    } catch (e) {
      console.error("Error enviando correo:", e);
    }
  }

  return NextResponse.json({ ok: true });
}
