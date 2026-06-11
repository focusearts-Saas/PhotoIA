export default function Home() {
  return (
    <div className="container">
      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "6rem 0", maxWidth: "800px", margin: "0 auto" }} className="animate-fade-in">
        <h1 style={{ fontSize: "4rem", marginBottom: "1.5rem" }}>
          Transforme suas fotos em <br />
          <span className="text-gradient">Ensaios Profissionais</span>
        </h1>
        <p className="text-secondary" style={{ fontSize: "1.25rem", marginBottom: "3rem" }}>
          A inteligência artificial que eleva a qualidade dos seus produtos. Ideal para lojas de roupas, hamburguerias, ensaios de bebês e muito mais. Sem precisar de fotógrafo profissional.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <a href="/generate" className="btn-primary" style={{ padding: "1rem 3rem", fontSize: "1.1rem" }}>
            Começar Agora
          </a>
          <button className="btn-secondary" style={{ padding: "1rem 3rem", fontSize: "1.1rem" }}>
            Ver Exemplos
          </button>
        </div>
      </section>

      {/* Features / Use Cases Grid */}
      <section className="mt-4 animate-fade-in delay-200">
        <div className="grid-cards">
          {/* Card 1 */}
          <div className="glass-panel">
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>🍔</div>
            <h3 style={{ marginBottom: "0.5rem" }}>Para Gastronomia</h3>
            <p className="text-secondary">Transforme fotos simples do seu cardápio em imagens apetitosas e iluminadas de forma cinematográfica.</p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel">
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>👗</div>
            <h3 style={{ marginBottom: "0.5rem" }}>Lojas de Roupas</h3>
            <p className="text-secondary">Remova o manequim ou coloque suas roupas em modelos realistas usando nossa IA avançada.</p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel">
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>👶</div>
            <h3 style={{ marginBottom: "0.5rem" }}>Ensaios Temáticos</h3>
            <p className="text-secondary">Tire uma foto do seu bebê em casa e escolha entre dezenas de cenários e temas encantadores.</p>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section className="mt-4 animate-fade-in delay-300" style={{ padding: "6rem 0", textAlign: "center" }}>
        <h2 style={{ fontSize: "2.5rem", marginBottom: "3rem" }}>Como funciona?</h2>
        <div className="grid-cards">
          <div className="glass-panel" style={{ background: "transparent", border: "none" }}>
            <h1 className="text-gradient" style={{ fontSize: "4rem" }}>1</h1>
            <h3>Envie a Foto</h3>
            <p className="text-secondary">Faça o upload de uma foto simples tirada com o celular.</p>
          </div>
          <div className="glass-panel" style={{ background: "transparent", border: "none" }}>
            <h1 className="text-gradient" style={{ fontSize: "4rem" }}>2</h1>
            <h3>Escolha o Tema</h3>
            <p className="text-secondary">Defina qual o estilo, cenário e clima que você deseja.</p>
          </div>
          <div className="glass-panel" style={{ background: "transparent", border: "none" }}>
            <h1 className="text-gradient" style={{ fontSize: "4rem" }}>3</h1>
            <h3>Receba a Mágica</h3>
            <p className="text-secondary">Em segundos, nossa IA entrega imagens prontas para uso profissional.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
