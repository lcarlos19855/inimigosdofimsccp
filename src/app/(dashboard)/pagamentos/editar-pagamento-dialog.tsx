"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useState, useTransition } from "react";
import { updatePagamento } from "./actions";

type CategoriaOpt = { id: string; nome: string };

function PencilIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
      aria-hidden
    >
      <path d="m2.695 14.762-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
    </svg>
  );
}

function formatValorInput(valor: string | number) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function EditarPagamentoDialog({
  pagamentoId,
  titularNome,
  categorias,
  categoriaId,
  vencimento,
  valor,
}: {
  pagamentoId: string;
  titularNome: string;
  categorias: CategoriaOpt[];
  categoriaId: string | null;
  vencimento: string;
  valor: string | number;
}) {
  const router = useRouter();
  const dialogId = useId();
  const [open, setOpen] = useState(false);
  const [categoria, setCategoria] = useState(categoriaId ?? "");
  const [venc, setVenc] = useState(vencimento);
  const [valorInput, setValorInput] = useState(formatValorInput(valor));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      setCategoria(categoriaId ?? "");
      setVenc(vencimento);
      setValorInput(formatValorInput(valor));
      setError(null);
    }
  }, [open, categoriaId, vencimento, valor]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updatePagamento(
        pagamentoId,
        categoria,
        venc,
        valorInput
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
        title="Editar"
        aria-label="Editar"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      >
        <PencilIcon />
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
              Editar pagamento
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              <span className="font-medium text-slate-800">{titularNome}</span>
            </p>
            <form onSubmit={(e) => void handleSubmit(e)} className="mt-4 space-y-4">
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 p-2 text-sm text-red-800">
                  {error}
                </p>
              )}
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Categoria *</span>
                <select
                  required
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  disabled={pending}
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
                >
                  <option value="" disabled>
                    Selecione a categoria…
                  </option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Vencimento *</span>
                <input
                  type="date"
                  required
                  value={venc}
                  onChange={(e) => setVenc(e.target.value)}
                  disabled={pending}
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none ring-blue-500 focus:ring-2 disabled:opacity-60"
                />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-700">Valor (R$) *</span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={valorInput}
                  onChange={(e) => setValorInput(e.target.value)}
                  disabled={pending}
                  placeholder="0,00"
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
                  {pending ? "Salvando…" : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
