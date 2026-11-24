import './globals.css';
export const metadata = { title: 'EMUNÁ', description: 'Publicidad digital y diseño web. Estudio boutique en Buenos Aires.' };
const FONTS = 'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Caveat+Brush&display=swap';
export default function Root({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTS} />
      </head>
      <body>{children}</body>
    </html>
  );
}
