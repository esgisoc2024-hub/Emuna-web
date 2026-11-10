import { Resend } from 'resend';
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const wrap = t => `<div style="font-family:system-ui,sans-serif;max-width:560px;margin:auto;color:#2C3320;line-height:1.6"><h2 style="font-family:Georgia,serif;letter-spacing:.12em;color:#6E7D4E">EMUNÁ<span style="color:#AA7229">.</span></h2>${esc(t).replace(/\n/g, '<br>')}</div>`;
export const send = ({ to, subject, text }) =>
  new Resend(process.env.RESEND_API_KEY).emails.send({ from: process.env.FROM_EMAIL, to, subject, html: wrap(text), text, replyTo: process.env.REPLY_TO });
