import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

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
              <Link href="/dashboard" className="text-secondary" style={{ textDecoration: "none" }}>Dashboard</Link>
              <Link href="/#nichos" className="text-secondary" style={{ textDecoration: "none" }}>Criar Ensaio</Link>
              <Link href="/login" className="btn-secondary">Entrar</Link>
            </div>
        </nav>
        <main style={{ paddingTop: "100px", paddingBottom: "4rem" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
