"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { excluirPagamento } from "./actions";

export function ExcluirPagamentoButton({ pagamentoId }: { pagamentoId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    if (
      !confirm(
        "Excluir este pagamento? Ele irá para a lista de excluídos e ficará registrado quem excluiu."
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await excluirPagamento(pagamentoId);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="rounded-lg border border-red-300 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-800 shadow-sm hover:bg-red-100 disabled:opacity-50"
      >
        {pending ? "Excluindo…" : "Excluir"}
      </button>
      {error && (
        <span className="max-w-[200px] text-center text-xs text-red-600">
          {error}
        </span>
      )}
    </div>
  );
}
