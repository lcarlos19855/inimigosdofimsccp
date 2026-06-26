"use client";

import { useState } from "react";
import { TitularRowActions } from "./titular-row-actions";
import {
  TitularDependentesDialog,
  type DependenteResumo,
  type TitularComDependentes,
} from "./titular-dependentes-dialog";

type TitularRow = {
  id: string;
  nome: string;
  cpf: string | null;
  email: string | null;
  whatsapp: string | null;
  status: "ativo" | "inativo";
};

export function TitularesTable({
  titulares,
  dependentesByTitular,
}: {
  titulares: TitularRow[];
  dependentesByTitular: Record<string, DependenteResumo[]>;
}) {
  const [selected, setSelected] = useState<TitularComDependentes | null>(null);

  function openTitular(t: TitularRow) {
    setSelected({
      ...t,
      dependentes: dependentesByTitular[t.id] ?? [],
    });
  }

  return (
    <>
      <tbody className="divide-y divide-slate-100">
        {titulares.map((t) => (
          <tr
            key={t.id}
            className="cursor-pointer hover:bg-blue-50/50"
            onClick={() => openTitular(t)}
            title="Clique para ver dependentes"
          >
            <td className="px-4 py-3 font-medium text-slate-900">{t.nome}</td>
            <td className="px-4 py-3 text-slate-600">{t.cpf ?? "—"}</td>
            <td className="px-4 py-3 text-slate-600">{t.email ?? "—"}</td>
            <td className="px-4 py-3 text-slate-600">{t.whatsapp ?? "—"}</td>
            <td className="px-4 py-3">
              <span
                className={
                  t.status === "ativo"
                    ? "inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                    : "inline-flex rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700"
                }
              >
                {t.status === "ativo" ? "Ativo" : "Inativo"}
              </span>
            </td>
            <td
              className="px-4 py-3 text-center align-middle"
              onClick={(e) => e.stopPropagation()}
            >
              <TitularRowActions titular={t} />
            </td>
          </tr>
        ))}
      </tbody>

      <TitularDependentesDialog
        titular={selected}
        open={selected !== null}
        onClose={() => setSelected(null)}
      />
    </>
  );
}
