import Link from "next/link";

export default function Adultos() {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: "5rem" }}>
      <header className="text-center" style={{ maxWidth: "800px", margin: "0 auto 4rem auto" }}>
        <h1 className="text-gradient" style={{ fontSize: "3rem", marginBottom: "1rem" }}>Retratos Profissionais e Ensaios Únicos</h1>
        <p className="text-secondary" style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          Gere fotos incríveis para o seu LinkedIn, Instagram de Negócios ou Crie ensaios artísticos usando I.A. de ponta.
        </p>
        <Link href="/generate/adultos" className="btn-primary" style={{ padding: "1rem 3rem", fontSize: "1.1rem" }}>
          Criar Meu Ensaio Agora
        </Link>
      </header>
      
      <div className="grid-cards">
        <div className="glass-panel text-center">
          <h3>Fotos para LinkedIn</h3>
          <p className="text-secondary">Cenários de escritório, ternos e blazers corporativos.</p>
        </div>
        <div className="glass-panel text-center">
          <h3>Ensaios Fotográficos</h3>
          <p className="text-secondary">Troque roupas, estilos e cenários livremente.</p>
        </div>
        <div className="glass-panel text-center">
          <h3>Avatares Criativos</h3>
          <p className="text-secondary">Estilo anime, pinturas a óleo, ou cyberpunk.</p>
        </div>
      </div>
    </div>
  );
}
