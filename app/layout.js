import "./globals.css";

export const metadata = {
  title: "LifeOS",
  description: "Meu sistema pessoal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
