"use client";

import { useActionState } from "react";
import { enviarComunicado } from "./actions";

type Props = {
  titularesComEmail: number;
  dependentesComEmail: number;
};

export function ComunicadosForm({
  titularesComEmail,
  dependentesComEmail,
}: Props) {
  const [state, formAction, pending] = useActionState(enviarComunicado, null);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-medium text-slate-800">Destinatários</p>
        <label className="flex items-start gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            name="enviar_titulares"
            defaultChecked
            disabled={pending || titularesComEmail === 0}
            className="mt-1 rounded"
          />
          <span>
            Titulares ativos com e-mail{" "}
            <span className="text-slate-500">({titularesComEmail})</span>
          </span>
        </label>
        <label className="flex items-start gap-2 text-sm text-slate-800">
          <input
            type="checkbox"
            name="enviar_dependentes"
            defaultChecked
            disabled={pending || dependentesComEmail === 0}
            className="mt-1 rounded"
          />
          <span>
            Dependentes ativos com e-mail{" "}
            <span className="text-slate-500">({dependentesComEmail})</span>
          </span>
        </label>
        <p className="text-xs text-slate-500">
          Cada pessoa recebe um e-mail individual (os destinatários não veem os
          e-mails uns dos outros).
        </p>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Assunto *</span>
        <input
          name="assunto"
          type="text"
          required
          maxLength={200}
          disabled={pending}
          placeholder="Ex.: Reunião do grupo"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
        />
      </label>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-700">Mensagem *</span>
        <textarea
          name="mensagem"
          required
          rows={8}
          disabled={pending}
          placeholder="Escreva o comunicado…"
          className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
        />
      </label>

      {state?.error && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {state.success}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar comunicado"}
      </button>
    </form>
  );
}
