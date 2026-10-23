import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "EUPHORIYA — Arquivo de um universo",
  description:
    "Um espaço para imaginar, conectar e preservar seu universo. Explore o Character Studio e os laços de Euphoriya.",
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
