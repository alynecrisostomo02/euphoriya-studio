import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./archive.css";
export const metadata: Metadata = {
  title: "EUPHORIYA — Arquivo de um universo",
  description:
    "A bíblia viva de Euphoriya: personagens, cânone, atlas, instituições, histórias e graphic novel em um arquivo autoral local.",
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { themeColor: "#151414" };
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
