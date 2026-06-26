"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "forgot";

export function LoginForm() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "forgot") {
        const redirectTo = `${window.location.origin}/auth/callback?next=/redefinir-senha`;
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo,
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        setMessage(
          "Se o e-mail estiver cadastrado, você receberá um link para redefinir a senha."
        );
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      window.location.href = "/dashboard";
    } finally {
      setLoading(false);
    }
  }

  const title = mode === "forgot" ? "Recuperar senha" : "Bem-vindo(a)!";

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-600">
          Inimigos do Fim — gestão da turma
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">E-mail</span>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          placeholder="voce@email.com"
          autoComplete="email"
        />
      </label>

      {mode !== "forgot" && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Senha</span>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </label>
      )}

      {mode === "forgot" && (
        <p className="text-sm text-slate-600">
          Enviaremos um link para o seu e-mail com instruções para criar uma nova
          senha.
        </p>
      )}

      {message && (
        <p
          className={`text-sm ${
            message.startsWith("Se o e-mail")
              ? "text-emerald-700"
              : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
      >
        {loading
          ? "Aguarde…"
          : mode === "forgot"
            ? "Enviar link"
            : "Entrar"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? (
          <button
            type="button"
            className="font-medium text-blue-600 hover:underline"
            onClick={() => {
              setMode("forgot");
              setMessage(null);
            }}
          >
            Esqueci minha senha
          </button>
        ) : (
          <>
            Lembrou a senha?{" "}
            <button
              type="button"
              className="font-medium text-blue-600 hover:underline"
              onClick={() => {
                setMode("login");
                setMessage(null);
              }}
            >
              Voltar ao login
            </button>
          </>
        )}
      </p>
    </form>
  );
}
