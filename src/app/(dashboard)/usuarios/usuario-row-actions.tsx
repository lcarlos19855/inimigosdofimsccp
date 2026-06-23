"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  alternarUsuarioAtivo,
  excluirUsuario,
} from "./actions";

export function UsuarioRowActions({
  userId,
  ativo,
}: {
  userId: string;
  ativo: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const res = await alternarUsuarioAtivo(userId, !ativo);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleExcluir() {
    if (
      !confirm(
        "Excluir este usuário permanentemente? Ele perderá acesso ao painel e o registro será removido do Auth."
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await excluirUsuario(userId);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1.5">
        <button
          type="button"
          onClick={handleToggle}
          disabled={pending}
          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-50 disabled:opacity-50"
        >
          {pending
            ? "…"
            : ativo
              ? "Inativar"
              : "Ativar"}
        </button>
        <button
          type="button"
          onClick={handleExcluir}
          disabled={pending}
          className="rounded-lg border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800 hover:bg-red-100 disabled:opacity-50"
        >
          Excluir
        </button>
      </div>
      {error && (
        <span className="max-w-[220px] text-right text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
