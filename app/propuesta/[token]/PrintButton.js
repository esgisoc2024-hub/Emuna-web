'use client';
export default function PrintButton() {
  return <button className="pp-btn" onClick={() => window.print()}>Descargar PDF</button>;
}
