"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useParams } from "next/navigation";

export default function GenerateNiche() {
  const { niche } = useParams();
  const [prompt, setPrompt] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const router = useRouter();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redireciona se não estiver logado
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login');
    });
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultImage(null);
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) {
      alert("Por favor, selecione uma imagem primeiro.");
      return;
    }

    setIsGenerating(true);
    setResultImage(null);

    const formData = new FormData();
    formData.append("imageFile", selectedFile);
    formData.append("niche", niche as string);
    formData.append("prompt", prompt);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("Sessão expirada. Faça login novamente.");
        router.push('/login');
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.imageUrl) {
        setResultImage(data.imageUrl);
      } else {
        alert("Erro: " + (data.error || "Ocorreu um erro desconhecido."));
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão ao gerar imagem.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = "meu_ensaio.png";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      alert("Clique com o botão direito na imagem e escolha 'Salvar imagem como...'");
    }
  };

  let title = "Criar Novo Ensaio";
  let subtitle = "Faça o upload da sua foto original.";
  let placeholder = "Descreva o que deseja...";

  if (niche === 'restaurantes') {
    title = "Gerar Imagem de Cardápio";
    subtitle = "Envie a foto do seu lanche/produto e veja a mágica.";
    placeholder = "Ex: Hambúrguer numa mesa de madeira rústica, fundo desfocado, iluminação dramática...";
  } else if (niche === 'criancas') {
    title = "Criar Ensaio Mágico (Kids)";
    subtitle = "Envie a foto do seu bebê para criar um cenário de mesversário.";
    placeholder = "Ex: Cenário de espaço sideral com foguetes, estrelas e um balão de 6 meses...";
  } else if (niche === 'adultos') {
    title = "Ensaio Profissional (Adultos)";
    subtitle = "Envie sua foto e descreva o estilo ou cenário desejado.";
    placeholder = "Ex: Vestindo terno azul em um escritório corporativo luxuoso...";
  }

  return (
    <div className="container animate-fade-in">
      <header style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "3rem", textTransform: "capitalize" }}>{title}</h1>
        <p className="text-secondary" style={{ fontSize: "1.2rem", marginTop: "0.5rem" }}>
          {subtitle}
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "start" }}>
        
        {/* Painel de Upload (Esquerda) */}
        <div className="glass-panel delay-100">
          <h2 style={{ marginBottom: "1.5rem" }}>1. Sua Foto Original</h2>
          
          <input 
            type="file" 
            accept="image/png, image/jpeg" 
            ref={fileInputRef} 
            style={{ display: "none" }} 
            onChange={handleFileChange}
          />

          {!previewUrl ? (
            <div style={{
              border: "2px dashed var(--glass-border)",
              borderRadius: "var(--radius-md)",
              padding: "4rem 2rem",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.3s ease",
              backgroundColor: "rgba(0,0,0,0.2)"
            }}
            onClick={() => fileInputRef.current?.click()}
            onMouseOver={(e) => e.currentTarget.style.borderColor = "var(--primary-color)"}
            onMouseOut={(e) => e.currentTarget.style.borderColor = "var(--glass-border)"}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📸</div>
              <h3>Clique para Enviar</h3>
              <p className="text-secondary">ou arraste e solte sua foto aqui</p>
              <p className="text-secondary" style={{ fontSize: "0.8rem", marginTop: "1rem" }}>PNG ou JPG até 10MB</p>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <img src={previewUrl} alt="Preview" style={{ maxWidth: "100%", borderRadius: "var(--radius-md)", maxHeight: "300px", objectFit: "contain", marginBottom: "1rem" }} />
              <button className="btn-secondary" onClick={() => fileInputRef.current?.click()}>Trocar Foto</button>
            </div>
          )}
        </div>

        {/* Painel de Configurações (Direita) */}
        <div className="glass-panel delay-200">
          <h2 style={{ marginBottom: "1.5rem" }}>2. Configurações da IA</h2>
          
          <div style={{ marginBottom: "2rem" }}>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "600" }}>Prompt / Descrição do Cenário</label>
            <textarea 
              className="input-glass" 
              rows={4} 
              placeholder={placeholder}
              style={{ resize: "vertical" }}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <button 
            className="btn-primary" 
            style={{ width: "100%", padding: "1rem", fontSize: "1.1rem", opacity: isGenerating ? 0.7 : 1, cursor: isGenerating ? "not-allowed" : "pointer" }}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "⏳ Gerando Ensaio..." : "✨ Gerar Ensaio (Custa 1 Crédito)"}
          </button>
        </div>
      </div>

      {/* Resultados Section */}
      {resultImage && (
        <div className="mt-4 animate-fade-in text-center" style={{ padding: "3rem 0" }}>
          <h2 style={{ marginBottom: "2rem" }}>🎉 Seu Ensaio está Pronto!</h2>
          <div className="glass-panel" style={{ display: "inline-block", padding: "1rem" }}>
            <img src={resultImage} alt="Resultado Gerado" style={{ maxWidth: "100%", borderRadius: "var(--radius-md)" }} />
          </div>
          <div className="mt-2">
            <button className="btn-primary" onClick={() => handleDownload(resultImage)}>Baixar Imagem</button>
          </div>
        </div>
      )}

    </div>
  );
}
