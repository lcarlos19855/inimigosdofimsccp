"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function RedefinirSenhaForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (password.length < 6) {
      setMessage("A senha deve ter ao menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setMessage("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setMessage(error.message);
        return;
      }
      setSuccess(true);
      window.setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        Senha atualizada com sucesso. Redirecionando…
      </p>
    );
  }

  return (
    <form
      onSubmit={(e) => void handleSubmit(e)}
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="text-center">
        <h1 className="text-xl font-semibold text-slate-900">Nova senha</h1>
        <p className="mt-1 text-sm text-slate-600">
          Defina a nova senha da sua conta.
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Nova senha</span>
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          autoComplete="new-password"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Confirmar senha</span>
        <input
          type="password"
          required
          minLength={6}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2"
          autoComplete="new-password"
        />
      </label>

      {message && (
        <p className="text-sm text-red-600">{message}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {loading ? "Salvando…" : "Salvar nova senha"}
      </button>
    </form>
  );
}
