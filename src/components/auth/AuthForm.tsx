"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Mode = "login" | "signup";

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "Email ou senha incorretos.",
  "Email not confirmed": "Email não confirmado. Verifique sua caixa de entrada.",
  "User already registered": "Este email já está cadastrado. Faça login.",
  "Password should be at least 6 characters": "A senha precisa ter pelo menos 6 caracteres.",
  "Unable to validate email address: invalid format": "Formato de email inválido.",
  "signup_disabled": "Cadastro desativado. Entre em contato com o suporte.",
};

function translateError(msg: string): string {
  return AUTH_ERRORS[msg] ?? msg;
}

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isLogin = mode === "login";

  async function handleEmail() {
    setError(null);
    setInfo(null);
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setError(translateError(error.message)); return; }
      router.push("/app");
      router.refresh();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) { setError(translateError(error.message)); return; }
      // Se sessão nula = confirmação de email pendente
      if (!data.session) {
        setInfo("Cadastro realizado! Verifique seu email para ativar a conta.");
        return;
      }
      router.push("/app");
      router.refresh();
    }
  }

  async function handleGoogle() {
    setError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div className="w-full max-w-sm">
      <div className="rounded-2xl border border-border bg-surface/50 p-7 backdrop-blur">
        <h1 className="text-xl font-semibold">
          {isLogin ? "Entrar na" : "Criar conta na"}{" "}
          <span className="text-gradient">gotan.ia</span>
        </h1>
        <p className="mt-1 text-sm text-muted">
          {isLogin ? "Bem-vindo de volta." : "Comece pequeno, escale quando precisar."}
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-xl border border-border bg-surface-2 px-4 text-sm text-fg placeholder:text-muted focus:border-orange/50 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 rounded-xl border border-border bg-surface-2 px-4 text-sm text-fg placeholder:text-muted focus:border-orange/50 focus:outline-none"
          />

          {error && <p className="text-sm text-orange-bright">{error}</p>}
          {info && <p className="text-sm text-accent">{info}</p>}

          <Button onClick={handleEmail} disabled={loading} className="mt-1 w-full">
            {loading ? "Aguarde..." : isLogin ? "Entrar" : "Criar conta"}
          </Button>

          <div className="my-1 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-border" /> ou <span className="h-px flex-1 bg-border" />
          </div>

          <Button variant="outline" onClick={handleGoogle} className="w-full">
            Continuar com Google
          </Button>
        </div>

        <p className="mt-6 text-center text-sm text-muted">
          {isLogin ? (
            <>
              Não tem conta?{" "}
              <a href="/signup" className="text-accent hover:text-fg">
                Cadastre-se
              </a>
            </>
          ) : (
            <>
              Já tem conta?{" "}
              <a href="/login" className="text-accent hover:text-fg">
                Entrar
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
