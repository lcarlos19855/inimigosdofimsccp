"use client";

import { useId, useState } from "react";

export type DependenteResumo = {
  id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  status: "ativo" | "inativo";
};

export type TitularComDependentes = {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  whatsapp: string | null;
  status: "ativo" | "inativo";
  dependentes: DependenteResumo[];
};

export function TitularDependentesDialog({
  titular,
  open,
  onClose,
}: {
  titular: TitularComDependentes | null;
  open: boolean;
  onClose: () => void;
}) {
  const dialogId = useId();

  if (!open || !titular) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${dialogId}-title`}
        className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-slate-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-slate-100 p-5">
          <h2
            id={`${dialogId}-title`}
            className="text-lg font-semibold text-slate-900"
          >
            {titular.nome}
          </h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-slate-500">CPF</dt>
              <dd className="font-medium text-slate-800">
                {titular.cpf ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Status</dt>
              <dd>
                <span
                  className={
                    titular.status === "ativo"
                      ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      : "inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                  }
                >
                  {titular.status === "ativo" ? "Ativo" : "Inativo"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">E-mail</dt>
              <dd className="font-medium text-slate-800">
                {titular.email ?? "—"}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">WhatsApp</dt>
              <dd className="font-medium text-slate-800">
                {titular.whatsapp ?? "—"}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex-1 overflow-auto p-5">
          <h3 className="text-sm font-semibold text-slate-800">
            Dependentes ({titular.dependentes.length})
          </h3>
          {titular.dependentes.length === 0 ? (
            <p className="mt-3 text-sm text-slate-500">
              Nenhum dependente vinculado a este titular.
            </p>
          ) : (
            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Nome</th>
                    <th className="px-3 py-2">E-mail</th>
                    <th className="px-3 py-2">WhatsApp</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {titular.dependentes.map((d) => (
                    <tr key={d.id}>
                      <td className="px-3 py-2 font-medium text-slate-900">
                        {d.nome}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {d.email ?? "—"}
                      </td>
                      <td className="px-3 py-2 text-slate-600">
                        {d.whatsapp ?? "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            d.status === "ativo"
                              ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                              : "inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                          }
                        >
                          {d.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100 p-4 text-right">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
