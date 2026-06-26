"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ExcluirComSenhaDialog } from "@/components/excluir-com-senha-dialog";
import type { Titular } from "@/types/database";
import {
  excluirDependente,
  toggleDependenteStatus,
} from "./actions";
import { EditarDependenteDialog } from "./editar-dependente-dialog";

type DependenteRow = {
  id: string;
  titular_id: string;
  nome: string;
  email: string | null;
  whatsapp: string | null;
  status: "ativo" | "inativo";
};

export function DependenteRowActions({
  dependente,
  titulares,
}: {
  dependente: DependenteRow;
  titulares: Titular[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const res = await toggleDependenteStatus(dependente.id);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  const ativo = dependente.status === "ativo";

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex items-center justify-center gap-1.5">
        <EditarDependenteDialog dependente={dependente} titulares={titulares} />
        <button
          type="button"
          title={ativo ? "Desativar" : "Ativar"}
          aria-label={ativo ? "Desativar" : "Ativar"}
          disabled={pending}
          onClick={handleToggle}
          className={
            ativo
              ? "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 text-amber-800 hover:bg-amber-50 disabled:opacity-50"
              : "inline-flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-200 text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
          }
        >
          <PowerIcon />
        </button>
        <ExcluirComSenhaDialog
          titulo="Excluir dependente"
          descricao={`Confirme com sua senha para excluir ${dependente.nome}. O registro ficará no histórico de auditoria.`}
          onConfirm={(password) => excluirDependente(dependente.id, password)}
        />
      </div>
      {error && (
        <span className="max-w-[220px] text-center text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}

function PowerIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M2 4.25A2.25 2.25 0 0 1 4.25 2h6.5A2.25 2.25 0 0 1 13 4.25V5.5H9.25v4.086a1.5 1.5 0 1 0 1.5 0V5.5H15v9.75A2.25 2.25 0 0 1 12.75 17.5h-6.5A2.25 2.25 0 0 1 4 15.25V4.25Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
