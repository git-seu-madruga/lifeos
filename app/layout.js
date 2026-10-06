import "./globals.css";
import PwaProvider from "../components/PwaProvider";

export const metadata = {
  title: "LifeOS",
  description: "Meu sistema pessoal",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "LifeOS", statusBarStyle: "black-translucent" },
  icons: { icon: [{url:"/favicon.ico",sizes:"any"},{url:"/icons/favicon-32.png",sizes:"32x32",type:"image/png"}], apple: "/icons/apple-touch-icon.png" },
};

export const viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0c0d10" };

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body><PwaProvider>{children}</PwaProvider></body>
    </html>
  );
}
