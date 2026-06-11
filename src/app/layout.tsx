import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PhotoIA - Ensaios Fotográficos Inteligentes",
  description: "Crie ensaios fotográficos incríveis com IA. Perfeito para produtos, roupas e retratos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <nav className="navbar">
          <div className="nav-brand">
            <span className="text-gradient">Photo</span>IA
          </div>
          <div style={{ display: "flex", gap: "1rem" }}>
            <a href="/login" className="btn-secondary">Login</a>
            <a href="/generate" className="btn-primary">Criar Ensaio</a>
          </div>
        </nav>
        <main style={{ paddingTop: "100px", paddingBottom: "4rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
