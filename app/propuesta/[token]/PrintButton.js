'use client';
// En propuestas HTML imprime solo el contenido del marco; en las de Claude, la página.
export default function PrintButton({ frame }) {
  const print = () => {
    const f = frame && document.querySelector('iframe.hf');
    if (f?.contentWindow) f.contentWindow.postMessage('emuna-print', '*'); else window.print();
  };
  return <button className="pp-btn" onClick={print}>Descargar PDF</button>;
}
