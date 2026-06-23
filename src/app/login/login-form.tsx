"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          setMessage(error.message);
          return;
        }
        window.location.href = "/dashboard";
        return;
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nome: nome.trim() || undefined },
        },
      });
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage(
        "Conta criada. Se o projeto exigir confirmação por e-mail, verifique sua caixa de entrada."
      );
      setMode("login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">
          Bem-vindo(a)!
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Inimigos do Fim — gestão de membros
        </p>
      </div>

      {mode === "register" && (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-700">Nome</span>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
            placeholder="Seu nome"
            autoComplete="name"
          />
        </label>
      )}

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
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </label>

      {message && (
        <p
          className={`text-sm ${message.startsWith("Conta criada") ? "text-emerald-700" : "text-red-600"}`}
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
          : mode === "login"
            ? "Entrar"
            : "Criar conta"}
      </button>

      <p className="text-center text-sm text-slate-600">
        {mode === "login" ? (
          <>
            Primeiro acesso?{" "}
            <button
              type="button"
              className="font-medium text-blue-600 hover:underline"
              onClick={() => {
                setMode("register");
                setMessage(null);
              }}
            >
              Criar conta
            </button>
          </>
        ) : (
          <>
            Já tem conta?{" "}
            <button
              type="button"
              className="font-medium text-blue-600 hover:underline"
              onClick={() => {
                setMode("login");
                setMessage(null);
              }}
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </form>
  );
}
