"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const [profile, setProfile] = useState<{ credits: number } | null>(null);
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }

      // Buscar créditos
      const { data: profileData } = await supabase
        .from("profiles")
        .select("credits")
        .eq("id", session.user.id)
        .single();
      
      if (profileData) setProfile(profileData);

      // Buscar histórico de imagens
      const { data: imagesData } = await supabase
        .from("images")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });
      
      if (imagesData) setImages(imagesData);

      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) return <div className="container" style={{ textAlign: "center", paddingTop: "5rem" }}>Carregando painel...</div>;

  return (
    <div className="container animate-fade-in">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem" }}>Meu Painel</h1>
          <p className="text-secondary">Gerencie seus ensaios e créditos.</p>
        </div>
        <div className="glass-panel" style={{ padding: "1rem 2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <div>
            <p className="text-secondary" style={{ fontSize: "0.9rem" }}>Saldo Atual</p>
            <h2 className="text-gradient" style={{ fontSize: "1.8rem" }}>{profile?.credits || 0} Créditos</h2>
          </div>
          <button className="btn-primary" style={{ padding: "0.5rem 1.5rem", fontSize: "0.9rem" }}>Recarregar</button>
          <button onClick={handleLogout} className="btn-secondary" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem", marginLeft: "1rem" }}>Sair</button>
        </div>
      </header>

      <section className="mt-4 delay-100">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2>Meus Ensaios Recentes</h2>
          <button onClick={() => router.push("/generate")} className="btn-secondary">Criar Novo Ensaio +</button>
        </div>

        {images.length === 0 ? (
          <div className="glass-panel text-center" style={{ padding: "4rem" }}>
            <p className="text-secondary" style={{ fontSize: "1.2rem" }}>Você ainda não gerou nenhum ensaio.</p>
            <button onClick={() => router.push("/generate")} className="btn-primary mt-2">Começar Agora</button>
          </div>
        ) : (
          <div className="grid-cards">
            {images.map((item) => (
              <div key={item.id} className="glass-panel" style={{ padding: "0", overflow: "hidden" }}>
                <div style={{ 
                  width: "100%", 
                  height: "250px", 
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundImage: `url(${item.generated_url})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center"
                }}>
                </div>
                <div style={{ padding: "1.5rem" }}>
                  <h3 style={{ marginBottom: "0.5rem", textTransform: "capitalize" }}>Ensaio: {item.category}</h3>
                  <p className="text-secondary" style={{ fontSize: "0.85rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {item.prompt}
                  </p>
                  <p className="text-secondary" style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                    Gerado em {new Date(item.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  <div className="mt-2" style={{ display: "flex", gap: "0.5rem" }}>
                    <a href={item.generated_url} target="_blank" rel="noreferrer" className="btn-secondary" style={{ flex: 1, padding: "0.5rem", textAlign: "center" }}>Baixar</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
