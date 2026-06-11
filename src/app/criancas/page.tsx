import Link from "next/link";

export default function Criancas() {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: "5rem" }}>
      <header className="text-center" style={{ maxWidth: "800px", margin: "0 auto 4rem auto" }}>
        <h1 className="text-gradient" style={{ fontSize: "3rem", marginBottom: "1rem" }}>O Mesversário Mágico do seu Bebê</h1>
        <p className="text-secondary" style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          Crie cenários fantásticos, fantasias e temas incríveis para eternizar os primeiros meses do seu bebê usando apenas uma foto comum.
        </p>
        <Link href="/generate/criancas" className="btn-primary" style={{ padding: "1rem 3rem", fontSize: "1.1rem" }}>
          Fazer o Primeiro Ensaio Grátis
        </Link>
      </header>
      
      <div className="grid-cards">
        <div className="glass-panel text-center">
          <h3>Temas de Heróis</h3>
          <p className="text-secondary">Super-heróis, princesas e muito mais.</p>
        </div>
        <div className="glass-panel text-center">
          <h3>Cenários Mágicos</h3>
          <p className="text-secondary">Fundo do mar, espaço, castelos encantados.</p>
        </div>
        <div className="glass-panel text-center">
          <h3>Datas Comemorativas</h3>
          <p className="text-secondary">Natal, Páscoa, Dia das Mães com temas especiais.</p>
        </div>
      </div>
    </div>
  );
}
