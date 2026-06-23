"use client";

import { useActionState } from "react";
import { createCategoria } from "./categorias-actions";

export function CategoriaForm() {
  const [state, formAction, pending] = useActionState(createCategoria, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-end"
    >
      {state?.error && (
        <p className="w-full rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 sm:col-span-full">
          {state.error}
        </p>
      )}
      <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Nova categoria</span>
        <input
          name="nome"
          type="text"
          required
          disabled={pending}
          placeholder="Ex.: Quadrimestral, Evento, Multa…"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Criar categoria"}
      </button>
    </form>
  );
}
