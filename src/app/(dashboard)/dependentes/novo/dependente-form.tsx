"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createDependente } from "../actions";
import type { Titular } from "@/types/database";

export function DependenteForm({ titulares }: { titulares: Titular[] }) {
  const [state, formAction, pending] = useActionState(createDependente, null);

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
        <span className="font-medium text-slate-700">Titular *</span>
        <select
          name="titular_id"
          required
          disabled={pending || titulares.length === 0}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          defaultValue=""
        >
          <option value="" disabled>
            {titulares.length === 0
              ? "Cadastre um titular primeiro"
              : "Selecione…"}
          </option>
          {titulares.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nome}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Nome completo *</span>
        <input
          name="nome"
          required
          disabled={pending}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          placeholder="Nome completo"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">E-mail</span>
        <input
          name="email"
          type="email"
          disabled={pending}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          placeholder="email@exemplo.com"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">WhatsApp</span>
        <input
          name="whatsapp"
          disabled={pending}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          placeholder="5511999999999"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Status</span>
        <select
          name="status"
          disabled={pending}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          defaultValue="ativo"
        >
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </select>
      </label>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending || titulares.length === 0}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        <Link
          href="/dependentes"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
