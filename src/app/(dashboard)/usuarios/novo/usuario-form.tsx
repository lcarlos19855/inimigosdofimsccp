"use client";

import Link from "next/link";
import { useActionState } from "react";
import { criarUsuario } from "../actions";

export function UsuarioForm() {
  const [state, formAction, pending] = useActionState(criarUsuario, null);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Nome completo *</span>
        <input
          name="nome"
          required
          disabled={pending}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          placeholder="Nome no painel"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">E-mail *</span>
        <input
          name="email"
          type="email"
          required
          disabled={pending}
          autoComplete="off"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          placeholder="usuario@email.com"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Senha inicial *</span>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          disabled={pending}
          autoComplete="new-password"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          placeholder="Mínimo 6 caracteres"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Perfil</span>
        <select
          name="perfil"
          disabled={pending}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          defaultValue="operador"
        >
          <option value="operador">Operador</option>
          <option value="administrador">Administrador</option>
        </select>
      </label>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Criando…" : "Incluir usuário"}
        </button>
        <Link
          href="/usuarios"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
