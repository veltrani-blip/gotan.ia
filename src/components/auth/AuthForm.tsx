"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prompt = searchParams.get("prompt") ?? "";
  const isLogin = mode === "login";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const redirectAfterAuth = prompt
    ? `/builder?prompt=${encodeURIComponent(prompt)}`
    : "/builder";

  async function handleEmail() {
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { error: authError } = isLogin
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    router.push(redirectAfterAuth);
    router.refresh();
  }

  async function handleGoogle() {
    setError(null);
    const supabase = createClient();
    const callbackUrl = new URL("/auth/callback", window.location.origin);
    if (prompt) callbackUrl.searchParams.set("prompt", prompt);

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
  }

  return (
    <main className="auth-shell">
      <div className="auth-card glass">
        <a href="/" className="auth-logo-link">
          <Image
            src="/branding/gotan-logo.png"
            alt="gotan.ia"
            width={160}
            height={50}
            priority
          />
        </a>

        <h1 className="auth-title">
          {isLogin ? "Entrar na" : "Criar conta na"}{" "}
          <span className="gradient-text">gotan.ia</span>
        </h1>
        <p className="auth-subtitle">
          {isLogin
            ? "Bem-vindo de volta."
            : "Comece grátis. Sem cartão obrigatório."}
        </p>

        <div className="auth-fields">
          <input
            className="auth-input"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleEmail();
            }}
            autoComplete="email"
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleEmail();
            }}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />

          {error && <div className="error-banner">{error}</div>}

          <button
            className="gradient-button auth-btn"
            type="button"
            disabled={loading}
            onClick={() => void handleEmail()}
          >
            {loading ? "Aguarde…" : isLogin ? "Entrar" : "Criar conta"}
          </button>

          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">ou</span>
            <span className="auth-divider-line" />
          </div>

          <button
            className="icon-button auth-btn"
            type="button"
            onClick={() => void handleGoogle()}
          >
            Continuar com Google
          </button>
        </div>

        <p className="auth-switch">
          {isLogin ? (
            <>
              Não tem conta?{" "}
              <a
                href={prompt ? `/signup?prompt=${encodeURIComponent(prompt)}` : "/signup"}
                className="auth-link"
              >
                Cadastre-se
              </a>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <a
                href={prompt ? `/login?prompt=${encodeURIComponent(prompt)}` : "/login"}
                className="auth-link"
              >
                Entrar
              </a>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
