import Link from "next/link";

export default function Restaurantes() {
  return (
    <div className="container animate-fade-in" style={{ paddingTop: "5rem" }}>
      <header className="text-center" style={{ maxWidth: "800px", margin: "0 auto 4rem auto" }}>
        <h1 className="text-gradient" style={{ fontSize: "3rem", marginBottom: "1rem" }}>Aumente as vendas do seu Delivery</h1>
        <p className="text-secondary" style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
          Transforme fotos simples do seu celular em imagens de cardápio irresistíveis. Sem precisar contratar fotógrafo.
        </p>
        <Link href="/generate/restaurantes" className="btn-primary" style={{ padding: "1rem 3rem", fontSize: "1.1rem" }}>
          Testar Grátis Agora
        </Link>
      </header>
      
      <div className="grid-cards">
        <div className="glass-panel text-center">
          <h3>Hambúrgueres</h3>
          <p className="text-secondary">Fundos de estúdio perfeitos para os seus lanches.</p>
        </div>
        <div className="glass-panel text-center">
          <h3>Pizzas e Porções</h3>
          <p className="text-secondary">Luz e sombra perfeitas que dão água na boca.</p>
        </div>
        <div className="glass-panel text-center">
          <h3>Bebidas e Sobremesas</h3>
          <p className="text-secondary">Destaque os ingredientes com alta resolução.</p>
        </div>
      </div>
    </div>
  );
}
