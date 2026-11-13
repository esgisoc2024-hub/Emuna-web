'use client';
import { useEffect, useRef, useState } from 'react';
import { SANDBOX, wrapHtml } from '@/lib/htmlProposal';

// Muestra una propuesta en HTML dentro de un marco aislado que se ajusta a su alto.
// Usá `src` para la página pública (servida aparte) o `html` para la vista previa del panel.
export default function HtmlFrame({ src, html, minHeight = 600, className = '' }) {
  const ref = useRef(null);
  const [h, setH] = useState(minHeight);
  useEffect(() => {
    const on = e => {
      if (e.source !== ref.current?.contentWindow) return;
      const v = Number(e.data?.emunaH);
      if (v > 0) setH(Math.min(Math.max(v, 200), 40000));
    };
    addEventListener('message', on);
    return () => removeEventListener('message', on);
  }, []);
  useEffect(() => { setH(minHeight); }, [src, html]);
  return (
    <iframe ref={ref} className={'hf ' + className} title="Propuesta" sandbox={SANDBOX}
      {...(src ? { src } : { srcDoc: wrapHtml(html) })}
      style={{ width: '100%', height: h, border: 0, display: 'block', background: '#fff' }} />
  );
}
