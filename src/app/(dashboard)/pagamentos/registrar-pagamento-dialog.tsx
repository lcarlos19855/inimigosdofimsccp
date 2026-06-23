"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { registrarRecebimentoPagamento } from "./actions";

function todayISODate() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function RegistrarPagamentoDialog({
  pagamentoId,
  titularNome,
  valorFormatado,
}: {
  pagamentoId: string;
  titularNome: string;
  valorFormatado: string;
}) {
  const router = useRouter();
  const dialogId = useId();
  const labelDataId = `${dialogId}-data`;
  const [open, setOpen] = useState(false);
  const [dataPagamento, setDataPagamento] = useState(todayISODate);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setDataPagamento(todayISODate());
      setError(null);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await registrarRecebimentoPagamento(
        pagamentoId,
        dataPagamento
      );
      if (res.error) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-100"
      >
        Registrar pago
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          role="presentation"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${dialogId}-title`}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape" && !pending) setOpen(false);
            }}
          >
            <h2
              id={`${dialogId}-title`}
              className="text-lg font-semibold text-slate-900"
            >
              Registrar pagamento recebido
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-800">{titularNome}</span>
              <span className="mx-1">·</span>
              <span>{valorFormatado}</span>
            </p>
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-800">
                  {error}
                </p>
              )}
              <label className="flex flex-col gap-1 text-sm" htmlFor={labelDataId}>
                <span className="font-medium text-slate-700">
                  Data do pagamento *
                </span>
                <input
                  id={labelDataId}
                  type="date"
                  required
                  value={dataPagamento}
                  onChange={(e) => setDataPagamento(e.target.value)}
                  disabled={pending}
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
                />
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {pending ? "Salvando…" : "Confirmar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
