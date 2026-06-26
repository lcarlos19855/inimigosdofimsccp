"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createMaterial } from "../actions";

export function MaterialForm() {
  const [state, formAction, pending] = useActionState(createMaterial, null);

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
        <span className="font-medium text-slate-700">Nome *</span>
        <input
          name="nome"
          required
          disabled={pending}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          placeholder="Ex.: Camiseta oficial"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Descrição</span>
        <textarea
          name="descricao"
          disabled={pending}
          rows={3}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
          placeholder="Detalhes do material (opcional)"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Quantidade *</span>
        <input
          name="quantidade"
          type="number"
          min={0}
          step={1}
          required
          defaultValue={0}
          disabled={pending}
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
        />
      </label>
      <div className="flex gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? "Salvando…" : "Salvar"}
        </button>
        <Link
          href="/materiais"
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
