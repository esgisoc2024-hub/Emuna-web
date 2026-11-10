import nodemailer from 'nodemailer';
import { Resend } from 'resend';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const wrap = t => `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;color:#2C3320;line-height:1.6"><h2 style="font-family:Georgia,serif;letter-spacing:.12em;color:#6E7D4E">EMUNÁ<span style="color:#AA7229">.</span></h2>${esc(t).replace(/\n/g, '<br>')}</div>`;
// Gmail (fase de prueba): si GMAIL_USER y GMAIL_APP_PASSWORD están cargadas, se envía desde esa cuenta a cualquier destinatario.
// Si no, se usa Resend (necesita dominio verificado para escribirle a terceros).
const gmail = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD
  ? nodemailer.createTransport({ service: 'gmail', auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD.replace(/\s+/g, '') } })
  : null;
export async function send({ to, subject, text }) {
  const html = wrap(text);
  if (gmail) {
    try {
      const info = await gmail.sendMail({ from: `EMUNÁ <${process.env.GMAIL_USER}>`, to, subject, text, html, replyTo: process.env.REPLY_TO || process.env.GMAIL_USER });
      return { data: { id: info.messageId }, error: null };
    } catch (e) {
      return { data: null, error: { message: e.message } };
    }
  }
  return new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.SENDER_EMAIL || 'EMUNÁ <onboarding@resend.dev>', to, subject, html, text, replyTo: process.env.REPLY_TO });
}
