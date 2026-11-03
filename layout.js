// Layout base. Se usará en las fases siguientes (panel /admin, /casos).
export const metadata = { title: "EMUNÁ" };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
