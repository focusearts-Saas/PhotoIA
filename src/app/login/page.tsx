"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Verifica a sessão inicial e redireciona caso o usuário clique no link de confirmação do e-mail
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    // Escuta mudanças de estado (ex: após confirmar e-mail)
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push("/dashboard");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        alert("Cadastro realizado! Por favor, verifique seu e-mail.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (error: any) {
      alert("Erro: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  };

  return (
    <div className="container animate-fade-in" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "450px", textAlign: "center" }}>
        <h1 style={{ marginBottom: "0.5rem" }}>{isSignUp ? "Criar Conta" : "Bem-vindo"}</h1>
        <p className="text-secondary" style={{ marginBottom: "2rem" }}>
          {isSignUp ? "Cadastre-se para receber 50 créditos grátis!" : "Acesse sua conta para criar ensaios."}
        </p>
        
        <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <input 
              type="email" 
              placeholder="Seu e-mail" 
              className="input-glass" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <input 
              type="password" 
              placeholder="Sua senha" 
              className="input-glass" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="btn-primary mt-1" style={{ width: "100%" }} disabled={loading}>
            {loading ? "Aguarde..." : (isSignUp ? "Cadastrar" : "Entrar")}
          </button>
        </form>

        <div className="mt-4">
          <p className="text-secondary">ou continue com</p>
          <button onClick={handleGoogleLogin} className="btn-secondary mt-1" style={{ width: "100%", display: "flex", justifyContent: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>G</span> Google
          </button>
        </div>
        
        <p className="text-secondary mt-4" style={{ fontSize: "0.9rem" }}>
          {isSignUp ? "Já tem conta?" : "Ainda não tem conta?"} 
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            style={{ color: "var(--primary-color)", fontWeight: "600", marginLeft: "0.5rem", background: "none", border: "none", cursor: "pointer" }}
          >
            {isSignUp ? "Faça Login" : "Cadastre-se"}
          </button>
        </p>
      </div>
    </div>
  );
}
