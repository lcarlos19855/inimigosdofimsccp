"use client";

import { useActionState } from "react";
import {
  registrarCaixaEntrada,
  registrarCaixaSaida,
  type CaixaFormState,
} from "./actions";

function EntradaForm() {
  const [state, formAction, pending] = useActionState<
    CaixaFormState,
    FormData
  >(registrarCaixaEntrada, null);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4"
    >
      <h2 className="text-sm font-semibold text-emerald-900">
        Entrada (saldo / depósito)
      </h2>
      <p className="text-xs text-emerald-800">
        Saldo inicial ou outras entradas que <strong>não</strong> entram pela
        aba Recebimentos. Recebimentos já marcados como Pago já entram no saldo
        disponível.
      </p>
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
          {state.error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Valor (R$) *</span>
        <input
          name="valor"
          type="text"
          inputMode="decimal"
          required
          disabled={pending}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-emerald-500 focus:ring-2 disabled:opacity-60"
          placeholder="0,00"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Descrição</span>
        <input
          name="descricao"
          disabled={pending}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-emerald-500 focus:ring-2 disabled:opacity-60"
          placeholder="Ex.: Saldo inicial, doação, arrecadação…"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Registrando…" : "Registrar entrada"}
      </button>
    </form>
  );
}

function SaidaForm() {
  const [state, formAction, pending] = useActionState<
    CaixaFormState,
    FormData
  >(registrarCaixaSaida, null);

  return (
    <form
      action={formAction}
      className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/60 p-4"
    >
      <h2 className="text-sm font-semibold text-amber-900">Saída manual</h2>
      <p className="text-xs text-amber-900">
        Registra retirada de caixa. O sistema impede saída acima do saldo
        disponível.
      </p>
      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-800">
          {state.error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Valor (R$) *</span>
        <input
          name="valor"
          type="text"
          inputMode="decimal"
          required
          disabled={pending}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-amber-500 focus:ring-2 disabled:opacity-60"
          placeholder="0,00"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Descrição</span>
        <input
          name="descricao"
          disabled={pending}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-amber-500 focus:ring-2 disabled:opacity-60"
          placeholder="Ex.: Compra material, taxa, reembolso…"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-700 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
      >
        {pending ? "Registrando…" : "Registrar saída"}
      </button>
    </form>
  );
}

export function CaixaForms() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <EntradaForm />
      <SaidaForm />
    </div>
  );
}
