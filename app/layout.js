import './globals.css';
export const metadata = { title: 'EMUNÁ', description: 'Estudio creativo y marketing digital.' };
const FONTS = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,800&family=Caveat+Brush&family=Fraunces:ital,wght@1,400;1,600&display=swap';
export default function Root({ children }) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
