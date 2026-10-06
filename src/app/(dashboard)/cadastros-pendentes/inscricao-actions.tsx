"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { aprovarInscricao, rejeitarInscricao } from "./actions";

export function InscricaoActions({
  inscricaoId,
  status,
}: {
  inscricaoId: string;
  status: string;
}) {
  const router = useRouter();
  const dialogId = useId();
  const [error, setError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [motivo, setMotivo] = useState("");
  const [pending, startTransition] = useTransition();

  if (status !== "pendente") {
    return <span className="text-xs text-slate-400">—</span>;
  }

  function handleAprovar() {
    setError(null);
    startTransition(async () => {
      const res = await aprovarInscricao(inscricaoId);
      if (res.error) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  function handleRejeitar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await rejeitarInscricao(inscricaoId, motivo);
      if (res.error) {
        setError(res.error);
        return;
      }
      setRejectOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex flex-wrap justify-end gap-1.5">
        <button
          type="button"
          disabled={pending}
          onClick={handleAprovar}
          className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {pending ? "…" : "Aprovar"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setMotivo("");
            setRejectOpen(true);
          }}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
        >
          Rejeitar
        </button>
      </div>
      {error && (
        <span className="max-w-[220px] text-right text-xs text-red-600">
          {error}
        </span>
      )}

      {rejectOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => !pending && setRejectOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              id={`${dialogId}-title`}
              className="text-lg font-semibold text-slate-900"
            >
              Rejeitar inscrição
            </h2>
            <form onSubmit={(e) => void handleRejeitar(e)} className="mt-4 space-y-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">
                  Motivo (opcional)
                </span>
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  disabled={pending}
                  rows={3}
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setRejectOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {pending ? "Rejeitando…" : "Confirmar rejeição"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
